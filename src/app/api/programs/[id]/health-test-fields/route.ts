import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// Check if user has access to program
async function checkProgramAccess(programId: string, session: any) {
  // Admins have access to all
  if (session.roleName === 'admin') {
    return { hasAccess: true };
  }

  // Academy managers can access their academy's programs
  if (session.roleName === 'academy_manager') {
    const result = await pool.query(
      `SELECT p.id FROM programs p
       JOIN academies a ON a.id = p.academy_id
       JOIN academy_managers am ON am.academy_id = a.id
       WHERE p.id = $1 AND am.user_id = $2`,
      [programId, session.userId]
    );
    if (result.rows.length === 0) {
      return { hasAccess: false, error: 'Access denied', status: 403 };
    }
    return { hasAccess: true };
  }

  return { hasAccess: false, error: 'Unauthorized', status: 401 };
}

// GET - List all health test fields for a program
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

    const access = await checkProgramAccess(programId, session);
    if (!access.hasAccess) {
      return NextResponse.json({ message: access.error }, { status: access.status || 403 });
    }

    const { rows } = await pool.query(
      `SELECT id, field_key, field_name, field_name_ar, field_type, field_unit, field_unit_ar,
              field_options, min_value, max_value, is_required, display_order, 
              description, description_ar, is_active, created_at, updated_at
       FROM program_health_test_fields
       WHERE program_id = $1
       ORDER BY display_order ASC, created_at ASC`,
      [programId]
    );

    return NextResponse.json({ fields: rows });
  } catch (error: any) {
    console.error('Get health test fields error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch health test fields' },
      { status: 500 }
    );
  }
}

// POST - Create a new health test field for a program
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.roleName !== 'admin' && session.roleName !== 'academy_manager') {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    const { id: programId } = await params;
    if (!programId) {
      return NextResponse.json({ message: 'Program ID is required' }, { status: 400 });
    }

    const access = await checkProgramAccess(programId, session);
    if (!access.hasAccess) {
      return NextResponse.json({ message: access.error }, { status: access.status || 403 });
    }

    const body = await request.json();
    const {
      field_key,
      field_name,
      field_name_ar,
      field_type = 'number',
      field_unit,
      field_unit_ar,
      field_options,
      min_value,
      max_value,
      is_required = false,
      display_order = 0,
      description,
      description_ar,
      is_active = true
    } = body;

    if (!field_key || !field_name) {
      return NextResponse.json(
        { message: 'field_key and field_name are required' },
        { status: 400 }
      );
    }

    // Validate field_type
    const validTypes = ['number', 'text', 'select', 'boolean', 'date', 'range'];
    if (!validTypes.includes(field_type)) {
      return NextResponse.json(
        { message: `Invalid field_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // For select type, field_options is required
    if (field_type === 'select' && (!field_options || !Array.isArray(field_options) || field_options.length === 0)) {
      return NextResponse.json(
        { message: 'field_options is required for select type fields' },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO program_health_test_fields 
       (program_id, field_key, field_name, field_name_ar, field_type, field_unit, field_unit_ar,
        field_options, min_value, max_value, is_required, display_order, description, description_ar, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        programId,
        field_key,
        field_name,
        field_name_ar || null,
        field_type,
        field_unit || null,
        field_unit_ar || null,
        field_options ? JSON.stringify(field_options) : null,
        min_value || null,
        max_value || null,
        is_required,
        display_order,
        description || null,
        description_ar || null,
        is_active
      ]
    );

    return NextResponse.json({
      message: 'Health test field created successfully',
      field: rows[0]
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create health test field error:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { message: 'A field with this key already exists for this program' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: error.message || 'Failed to create health test field' },
      { status: 500 }
    );
  }
}
