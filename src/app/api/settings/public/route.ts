import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Public endpoint to get site settings (no auth required)
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT setting_key, setting_value FROM site_settings'
    );

    const settings: Record<string, string> = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching public settings:', error);
    // Return defaults if error
    return NextResponse.json({
      settings: {
        font_arabic: 'IBM Plex Sans Arabic',
        font_english: 'Inter',
        font_size_base: '16',
        font_size_heading_1: '48',
        font_size_heading_2: '36',
        font_size_heading_3: '24',
        font_size_heading_4: '20',
      }
    });
  }
}
