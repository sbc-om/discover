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
    const { status, delivery_date, review_notes, shipping_date, tracking_number } = body || {};

    const validStatuses = ['pending', 'approved', 'rejected', 'preparing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    // Build dynamic update query
    const updates: string[] = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [status];
    let paramIndex = 2;

    // Add delivery_date if provided
    if (delivery_date !== undefined) {
      updates.push(`delivery_date = $${paramIndex}`);
      values.push(delivery_date || null);
      paramIndex++;
    }

    // Add review fields for approval/rejection
    if (['approved', 'rejected'].includes(status)) {
      updates.push(`review_date = CURRENT_DATE`);
      updates.push(`reviewed_by = $${paramIndex}`);
      values.push(session.userId);
      paramIndex++;
    }

    // Add review_notes if provided
    if (review_notes !== undefined) {
      updates.push(`review_notes = $${paramIndex}`);
      values.push(review_notes || null);
      paramIndex++;
    }

    // Add shipping fields
    if (shipping_date !== undefined) {
      updates.push(`shipping_date = $${paramIndex}`);
      values.push(shipping_date || null);
      paramIndex++;
    }

    if (tracking_number !== undefined) {
      updates.push(`tracking_number = $${paramIndex}`);
      values.push(tracking_number || null);
      paramIndex++;
    }

    // Mark delivered_at timestamp
    if (status === 'delivered') {
      updates.push(`delivered_at = CURRENT_TIMESTAMP`);
    }

    values.push(id);

    const { rows } = await pool.query(
      `UPDATE medal_requests
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, medal_type, achievement_description, status, requested_date, delivery_date, 
                 review_date, review_notes, shipping_date, tracking_number, delivered_at`,
      values
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
