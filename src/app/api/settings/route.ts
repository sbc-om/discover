import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import pool from '@/lib/db';

export async function GET() {
  try {
    const session = await requireAuth();
    
    // Only admin can access settings
    if (session.roleName !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      'SELECT setting_key, setting_value FROM site_settings'
    );

    const settings: Record<string, string> = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    // Only admin can update settings
    if (session.roleName !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      font_arabic,
      font_english,
      font_size_base,
      font_size_heading_1,
      font_size_heading_2,
      font_size_heading_3,
      font_size_heading_4,
    } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const settings = [
        { key: 'font_arabic', value: font_arabic },
        { key: 'font_english', value: font_english },
        { key: 'font_size_base', value: font_size_base },
        { key: 'font_size_heading_1', value: font_size_heading_1 },
        { key: 'font_size_heading_2', value: font_size_heading_2 },
        { key: 'font_size_heading_3', value: font_size_heading_3 },
        { key: 'font_size_heading_4', value: font_size_heading_4 },
      ];

      for (const setting of settings) {
        await client.query(
          `INSERT INTO site_settings (setting_key, setting_value, updated_by)
           VALUES ($1, $2, $3)
           ON CONFLICT (setting_key) 
           DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP, updated_by = $3`,
          [setting.key, setting.value, session.userId]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({ message: 'Settings saved successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
