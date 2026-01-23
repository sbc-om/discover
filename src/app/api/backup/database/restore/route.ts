import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import pool from '@/lib/db';

// POST - Restore database from backup (Admin only)
export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    await requireRole(['admin']);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.sql')) {
      return NextResponse.json(
        { message: 'Invalid file type. Only .sql files are allowed.' },
        { status: 400 }
      );
    }

    // Read SQL file content
    const sqlContent = await file.text();

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        stmt !== '\n'
      );

    // Begin transaction
    await client.query('BEGIN');

    try {
      // Execute each SQL statement
      for (const statement of statements) {
        if (statement) {
          await client.query(statement);
        }
      }

      // Commit transaction
      await client.query('COMMIT');

      return NextResponse.json({
        message: 'Database restored successfully',
        success: true,
        statementsExecuted: statements.length,
      });
    } catch (execError: any) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw execError;
    }
  } catch (error: any) {
    console.error('Database restore error:', error);

    return NextResponse.json(
      { message: error.message || 'Failed to restore database' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  } finally {
    client.release();
  }
}
