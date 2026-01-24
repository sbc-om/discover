import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(['admin']);
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Request id is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, delivery_date, review_notes } = body || {};

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    if (status === 'approved' && !delivery_date) {
      return NextResponse.json({ message: 'Delivery date is required' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `UPDATE medal_requests
       SET status = $1,
           delivery_date = $2,
           review_notes = $3,
           review_date = CURRENT_DATE,
           reviewed_by = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, medal_type, achievement_description, status, requested_date, delivery_date, review_date, review_notes`,
      [status, delivery_date || null, review_notes || null, session.userId, id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Request updated', request: rows[0] });
  } catch (error: any) {
    console.error('Update medal request error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update request' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
