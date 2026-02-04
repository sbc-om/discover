import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// GET - Get player's health test results with dynamic fields for a specific program
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: playerId } = await params;
    if (!playerId) {
      return NextResponse.json({ message: 'Player ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('program_id');

    // Check access
    if (session.roleName === 'player' && session.userId !== playerId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (session.roleName === 'academy_manager') {
      const accessCheck = await pool.query(
        `SELECT 1 FROM users u
         JOIN academy_managers am ON am.academy_id = u.academy_id
         WHERE u.id = $1 AND am.user_id = $2`,
        [playerId, session.userId]
      );
      if (accessCheck.rows.length === 0) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    // Get all programs for the player if no specific program is requested
    let programsToFetch: string[] = [];
    
    if (programId) {
      programsToFetch = [programId];
    } else {
      const programsResult = await pool.query(
        `SELECT DISTINCT program_id FROM player_programs WHERE user_id = $1`,
        [playerId]
      );
      programsToFetch = programsResult.rows.map((r: any) => r.program_id);
    }

    if (programsToFetch.length === 0) {
      return NextResponse.json({ tests: [], fields: [] });
    }

    // Get health test fields for the programs
    const fieldsResult = await pool.query(
      `SELECT id, program_id, field_key, field_name, field_name_ar, field_type, 
              field_unit, field_unit_ar, field_options, min_value, max_value, 
              is_required, display_order, description, description_ar, is_active
       FROM program_health_test_fields
       WHERE program_id = ANY($1) AND is_active = true
       ORDER BY program_id, display_order ASC`,
      [programsToFetch]
    );

    // Get health tests for this player with the programs
    const testsQuery = `
      SELECT 
        ht.id, ht.user_id, ht.program_id, ht.status, ht.requested_at, ht.scheduled_at, 
        ht.test_date, ht.completed_at, ht.height, ht.weight, ht.blood_pressure, 
        ht.heart_rate, ht.notes, ht.review_notes,
        ht.speed_score, ht.agility_score, ht.power_score, ht.balance_score,
        ht.reaction_score, ht.coordination_score, ht.flexibility_score,
        p.name as program_name, p.name_ar as program_name_ar
      FROM health_tests ht
      LEFT JOIN programs p ON p.id = ht.program_id
      WHERE ht.user_id = $1
        ${programId ? 'AND ht.program_id = $2' : ''}
      ORDER BY ht.test_date DESC NULLS LAST, ht.completed_at DESC NULLS LAST, ht.created_at DESC
    `;
    
    const testsResult = await pool.query(
      testsQuery,
      programId ? [playerId, programId] : [playerId]
    );

    // Get dynamic field results for each test
    const testsWithResults = await Promise.all(
      testsResult.rows.map(async (test: any) => {
        const resultsResult = await pool.query(
          `SELECT 
            phtr.id, phtr.field_id, phtr.value_text, phtr.value_number, 
            phtr.value_boolean, phtr.value_date, phtr.notes,
            phtf.field_key, phtf.field_name, phtf.field_name_ar, phtf.field_type,
            phtf.field_unit, phtf.field_unit_ar, phtf.field_options, 
            phtf.min_value, phtf.max_value
          FROM player_health_test_results phtr
          JOIN program_health_test_fields phtf ON phtf.id = phtr.field_id
          WHERE phtr.health_test_id = $1
          ORDER BY phtf.display_order ASC`,
          [test.id]
        );

        return {
          ...test,
          dynamic_results: resultsResult.rows.map((r: any) => ({
            id: r.id,
            field_id: r.field_id,
            field_key: r.field_key,
            field_name: r.field_name,
            field_name_ar: r.field_name_ar,
            field_type: r.field_type,
            field_unit: r.field_unit,
            field_unit_ar: r.field_unit_ar,
            field_options: r.field_options,
            min_value: r.min_value,
            max_value: r.max_value,
            value: r.field_type === 'number' || r.field_type === 'range' 
              ? r.value_number 
              : r.field_type === 'boolean' 
                ? r.value_boolean 
                : r.field_type === 'date' 
                  ? r.value_date 
                  : r.value_text,
            notes: r.notes
          }))
        };
      })
    );

    // Group fields by program
    const fieldsByProgram: Record<string, any[]> = {};
    for (const field of fieldsResult.rows) {
      if (!fieldsByProgram[field.program_id]) {
        fieldsByProgram[field.program_id] = [];
      }
      fieldsByProgram[field.program_id].push(field);
    }

    return NextResponse.json({ 
      tests: testsWithResults,
      fields: fieldsResult.rows,
      fieldsByProgram
    });
  } catch (error: any) {
    console.error('Get player health test results error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch health test results' },
      { status: 500 }
    );
  }
}

// POST - Record health test results with dynamic fields
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'academy_manager', 'coach'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    const { id: playerId } = await params;
    if (!playerId) {
      return NextResponse.json({ message: 'Player ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { health_test_id, results } = body;

    if (!health_test_id) {
      return NextResponse.json({ message: 'health_test_id is required' }, { status: 400 });
    }

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ message: 'results array is required' }, { status: 400 });
    }

    // Verify health test belongs to this player
    const testCheck = await pool.query(
      'SELECT id, user_id, program_id FROM health_tests WHERE id = $1',
      [health_test_id]
    );

    if (testCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Health test not found' }, { status: 404 });
    }

    if (testCheck.rows[0].user_id !== playerId) {
      return NextResponse.json({ message: 'Health test does not belong to this player' }, { status: 400 });
    }

    // Academy manager permission check
    if (session.roleName === 'academy_manager') {
      const accessCheck = await pool.query(
        `SELECT 1 FROM users u
         JOIN academy_managers am ON am.academy_id = u.academy_id
         WHERE u.id = $1 AND am.user_id = $2`,
        [playerId, session.userId]
      );
      if (accessCheck.rows.length === 0) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    // Insert/update results
    const insertedResults = [];
    for (const result of results) {
      const { field_id, value, notes } = result;

      if (!field_id) continue;

      // Get field type
      const fieldResult = await pool.query(
        'SELECT field_type FROM program_health_test_fields WHERE id = $1',
        [field_id]
      );

      if (fieldResult.rows.length === 0) continue;

      const fieldType = fieldResult.rows[0].field_type;

      // Prepare values based on field type
      let valueText = null;
      let valueNumber = null;
      let valueBoolean = null;
      let valueDate = null;

      if (fieldType === 'number' || fieldType === 'range') {
        valueNumber = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(valueNumber)) valueNumber = null;
      } else if (fieldType === 'boolean') {
        valueBoolean = Boolean(value);
      } else if (fieldType === 'date') {
        valueDate = value ? new Date(value).toISOString().split('T')[0] : null;
      } else {
        valueText = String(value || '');
      }

      // Upsert the result
      const upsertResult = await pool.query(
        `INSERT INTO player_health_test_results 
         (health_test_id, field_id, value_text, value_number, value_boolean, value_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (health_test_id, field_id) 
         DO UPDATE SET 
           value_text = EXCLUDED.value_text,
           value_number = EXCLUDED.value_number,
           value_boolean = EXCLUDED.value_boolean,
           value_date = EXCLUDED.value_date,
           notes = EXCLUDED.notes,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [health_test_id, field_id, valueText, valueNumber, valueBoolean, valueDate, notes || null]
      );

      insertedResults.push(upsertResult.rows[0]);
    }

    return NextResponse.json({
      message: 'Health test results saved successfully',
      results: insertedResults
    }, { status: 201 });
  } catch (error: any) {
    console.error('Save health test results error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to save health test results' },
      { status: 500 }
    );
  }
}
