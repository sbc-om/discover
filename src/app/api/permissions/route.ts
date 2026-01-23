import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET all permissions grouped by module (Admin only)
export async function GET(request: Request) {
  try {
    await requireRole(['admin']);

    const { rows } = await pool.query(`
      SELECT 
        m.id as module_id, m.name as module_name, 
        m.name_ar as module_name_ar, m.name_en as module_name_en,
        m.icon, m.route, m.display_order,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'name_ar', p.name_ar,
            'name_en', p.name_en,
            'action', p.action
          ) ORDER BY p.action
        ) as permissions
      FROM modules m
      LEFT JOIN permissions p ON p.module_id = m.id
      WHERE m.is_active = true
      GROUP BY m.id
      ORDER BY m.display_order
    `);

    return NextResponse.json({ modules: rows });
  } catch (error: any) {
    console.error('Get permissions error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch permissions' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
