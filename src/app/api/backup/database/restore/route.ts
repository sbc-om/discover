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

    // Parse SQL into different categories
    const lines = sqlContent.split('\n');
    const dropStatements: string[] = [];
    const createTableStatements: string[] = [];
    const insertStatements: string[] = [];
    const primaryKeyStatements: string[] = [];
    const foreignKeyStatements: string[] = [];
    const uniqueConstraintStatements: string[] = [];
    const indexStatements: string[] = [];
    const sequenceStatements: string[] = [];
    const otherStatements: string[] = [];

    const referencedSequences = new Set<string>();

    let currentStatement = '';
    let inMultiLineStatement = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines when not in a statement
      if (!inMultiLineStatement && (trimmedLine.startsWith('--') || trimmedLine === '')) {
        continue;
      }

      currentStatement += line + '\n';
      inMultiLineStatement = true;

      // Check if statement is complete (ends with semicolon, not inside quotes)
      if (trimmedLine.endsWith(';')) {
        const stmt = currentStatement.trim();
        const upperStmt = stmt.toUpperCase();

        const sequenceMatches = stmt.match(/nextval\('([^']+)'::regclass\)/gi) || [];
        for (const match of sequenceMatches) {
          const seqName = match.match(/nextval\('([^']+)'::regclass\)/i)?.[1];
          if (seqName) {
            referencedSequences.add(seqName);
          }
        }
        
        if (upperStmt.startsWith('DROP TABLE')) {
          dropStatements.push(stmt);
        } else if (upperStmt.startsWith('CREATE TABLE')) {
          createTableStatements.push(stmt);
        } else if (upperStmt.startsWith('INSERT INTO')) {
          insertStatements.push(stmt);
        } else if (upperStmt.startsWith('ALTER TABLE')) {
          // Separate PRIMARY KEY, UNIQUE, and FOREIGN KEY constraints
          if (upperStmt.includes('PRIMARY KEY')) {
            primaryKeyStatements.push(stmt);
          } else if (upperStmt.includes('FOREIGN KEY') || upperStmt.includes('REFERENCES')) {
            foreignKeyStatements.push(stmt);
          } else if (upperStmt.includes('UNIQUE')) {
            uniqueConstraintStatements.push(stmt);
          } else {
            primaryKeyStatements.push(stmt); // Other constraints go with PKs
          }
        } else if (upperStmt.startsWith('CREATE INDEX') || upperStmt.startsWith('CREATE UNIQUE INDEX')) {
          indexStatements.push(stmt);
        } else if (upperStmt.includes('SETVAL(')) {
          sequenceStatements.push(stmt);
        } else if (upperStmt.startsWith('SET ')) {
          otherStatements.push(stmt);
        }
        
        currentStatement = '';
        inMultiLineStatement = false;
      }
    }

    console.log('Parsed statements:', {
      drops: dropStatements.length,
      creates: createTableStatements.length,
      inserts: insertStatements.length,
      primaryKeys: primaryKeyStatements.length,
      uniqueConstraints: uniqueConstraintStatements.length,
      foreignKeys: foreignKeyStatements.length,
      indexes: indexStatements.length,
      sequences: sequenceStatements.length,
      others: otherStatements.length,
    });

    // Begin transaction
    await client.query('BEGIN');

    try {
      // 1. Drop all existing tables
      await client.query(`
        DO $$ 
        DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
        END $$;
      `);

      // 2. Execute SET statements
      for (const stmt of otherStatements) {
        if (stmt.startsWith('SET ')) {
          await client.query(stmt);
        }
      }

      // 3. Ensure sequences referenced in defaults exist
      for (const seqName of referencedSequences) {
        try {
          const isSafeName = /^[a-zA-Z0-9_\.\"]+$/.test(seqName);
          if (!isSafeName) {
            console.warn('Skipping unsafe sequence name:', seqName);
            continue;
          }
          await client.query(`CREATE SEQUENCE IF NOT EXISTS ${seqName}`);
        } catch (err: any) {
          console.warn('Sequence create warning:', err.message);
        }
      }

      // 4. Create tables (without constraints)
      for (const stmt of createTableStatements) {
        await client.query(stmt);
      }

      // 5. Add PRIMARY KEY constraints FIRST (required for foreign keys)
      for (const stmt of primaryKeyStatements) {
        try {
          await client.query(stmt);
        } catch (err: any) {
          console.warn('Primary key warning:', err.message);
        }
      }

      // 6. Add UNIQUE constraints (may be needed for foreign keys)
      for (const stmt of uniqueConstraintStatements) {
        try {
          await client.query(stmt);
        } catch (err: any) {
          console.warn('Unique constraint warning:', err.message);
        }
      }

      // 7. Insert data
      for (const stmt of insertStatements) {
        await client.query(stmt);
      }

      // 8. Add FOREIGN KEY constraints AFTER data and primary keys
      for (const stmt of foreignKeyStatements) {
        try {
          await client.query(stmt);
        } catch (err: any) {
          // Skip if constraint already exists
          if (!err.message.includes('already exists')) {
            console.warn('Foreign key warning:', err.message);
          }
        }
      }

      // 9. Create indexes
      for (const stmt of indexStatements) {
        try {
          await client.query(stmt);
        } catch (err: any) {
          // Skip if index already exists
          if (!err.message.includes('already exists')) {
            console.warn('Index warning:', err.message);
          }
        }
      }

      // 10. Set sequence values
      for (const stmt of sequenceStatements) {
        try {
          await client.query(stmt);
        } catch (err: any) {
          console.warn('Sequence warning:', err.message);
        }
      }

      // Commit transaction
      await client.query('COMMIT');

      return NextResponse.json({
        message: 'Database restored successfully',
        success: true,
        stats: {
          tables: createTableStatements.length,
          inserts: insertStatements.length,
          primaryKeys: primaryKeyStatements.length,
          foreignKeys: foreignKeyStatements.length,
          indexes: indexStatements.length,
        }
      });
    } catch (execError: any) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw execError;
    }
  } catch (error: any) {
    console.error('Database restore error:', error);
    const status = error.message === 'Forbidden'
      ? 403
      : error.message === 'Unauthorized'
        ? 401
        : 500;

    return NextResponse.json(
      { message: error.message || 'Failed to restore database' },
      { status }
    );
  } finally {
    client.release();
  }
}
