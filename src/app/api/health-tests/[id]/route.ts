import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'academy_manager', 'coach'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Test id is required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      status,
      scheduled_at,
      review_notes,
      height,
      weight,
      blood_pressure,
      heart_rate,
      notes,
      speed_score,
      agility_score,
      power_score,
      balance_score,
      reaction_score,
      coordination_score,
      flexibility_score,
    } = body;

    const updates: string[] = [];
    const paramsList: any[] = [];
    let index = 1;

    const setField = (field: string, value: any) => {
      updates.push(`${field} = $${index}`);
      paramsList.push(value);
      index += 1;
    };

    const toDateOnly = (value: string) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString().slice(0, 10);
    };

    if (status) {
      setField('status', status);
    }

    if (status === 'approved') {
      if (!scheduled_at) {
        return NextResponse.json(
          { message: 'Scheduled time is required' },
          { status: 400 }
        );
      }
      setField('scheduled_at', scheduled_at);
      setField('test_date', toDateOnly(scheduled_at));
      setField('reviewed_by', session.userId);
      if (review_notes) {
        setField('review_notes', review_notes);
      }
    }

    if (status === 'rejected') {
      setField('reviewed_by', session.userId);
      if (review_notes) {
        setField('review_notes', review_notes);
      }
      updates.push('scheduled_at = NULL');
    }

    if (status === 'completed') {
      setField('completed_at', new Date().toISOString());
      setField('reviewed_by', session.userId);
      if (scheduled_at) {
        setField('scheduled_at', scheduled_at);
        setField('test_date', toDateOnly(scheduled_at));
      } else {
        setField('test_date', toDateOnly(new Date().toISOString()));
      }
    }

    if (height !== undefined) setField('height', height || null);
    if (weight !== undefined) setField('weight', weight || null);
    if (blood_pressure !== undefined) setField('blood_pressure', blood_pressure || null);
    if (heart_rate !== undefined) setField('heart_rate', heart_rate || null);
    if (notes !== undefined) setField('notes', notes || null);
    if (speed_score !== undefined) setField('speed_score', speed_score || null);
    if (agility_score !== undefined) setField('agility_score', agility_score || null);
    if (power_score !== undefined) setField('power_score', power_score || null);
    if (balance_score !== undefined) setField('balance_score', balance_score || null);
    if (reaction_score !== undefined) setField('reaction_score', reaction_score || null);
    if (coordination_score !== undefined) setField('coordination_score', coordination_score || null);
    if (flexibility_score !== undefined) setField('flexibility_score', flexibility_score || null);

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No updates provided' }, { status: 400 });
    }

    const query = `UPDATE health_tests SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;
    paramsList.push(id);

    const { rows } = await pool.query(query, paramsList);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({ test: rows[0] });
  } catch (error: any) {
    console.error('Update health test error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update test' },
      { status: 500 }
    );
  }
}
