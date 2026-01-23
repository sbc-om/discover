import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import pool from '@/lib/db';

// POST - Create database backup (Admin only)
export async function POST() {
  try {
    await requireRole(['admin']);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Generate SQL dump using native PostgreSQL queries
    let sqlDump = `-- Database backup created at ${new Date().toISOString()}\n`;
    sqlDump += `-- PostgreSQL database dump\n\n`;
    sqlDump += `SET statement_timeout = 0;\n`;
    sqlDump += `SET lock_timeout = 0;\n`;
    sqlDump += `SET client_encoding = 'UTF8';\n`;
    sqlDump += `SET standard_conforming_strings = on;\n\n`;

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const tables = tablesResult.rows.map(row => row.tablename);

    // For each table, get schema and data
    for (const table of tables) {
      sqlDump += `\n-- Table: ${table}\n`;
      sqlDump += `DROP TABLE IF EXISTS ${table} CASCADE;\n\n`;

      // Get table schema
      const schemaResult = await pool.query(`
        SELECT 
          'CREATE TABLE ' || quote_ident(c.relname) || ' (' || 
          string_agg(
            quote_ident(attname) || ' ' || 
            format_type(atttypid, atttypmod) || 
            CASE WHEN attnotnull THEN ' NOT NULL' ELSE '' END ||
            CASE WHEN atthasdef THEN ' DEFAULT ' || pg_get_expr(adbin, adrelid) ELSE '' END,
            ', '
          ) || ');' as create_statement
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        LEFT JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum
        WHERE n.nspname = 'public' 
          AND c.relname = $1
          AND a.attnum > 0 
          AND NOT a.attisdropped
        GROUP BY c.relname
      `, [table]);

      if (schemaResult.rows.length > 0) {
        sqlDump += schemaResult.rows[0].create_statement + '\n\n';
      }

      // Get table data
      const dataResult = await pool.query(`SELECT * FROM ${table}`);
      
      if (dataResult.rows.length > 0) {
        // Get column names
        const columns = Object.keys(dataResult.rows[0]);
        
        for (const row of dataResult.rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            if (typeof val === 'number') return val.toString();
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          
          sqlDump += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sqlDump += '\n';
      }
    }

    // Get sequences
    const sequencesResult = await pool.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);

    for (const seq of sequencesResult.rows) {
      const seqName = seq.sequence_name;
      const seqValueResult = await pool.query(`SELECT last_value FROM ${seqName}`);
      if (seqValueResult.rows.length > 0) {
        sqlDump += `\n-- Sequence: ${seqName}\n`;
        sqlDump += `SELECT setval('${seqName}', ${seqValueResult.rows[0].last_value}, true);\n`;
      }
    }

    // Get constraints and indexes
    for (const table of tables) {
      // Primary keys
      const pkResult = await pool.query(`
        SELECT pg_get_constraintdef(oid) as constraint_def, conname
        FROM pg_constraint
        WHERE conrelid = $1::regclass AND contype = 'p'
      `, [table]);

      for (const pk of pkResult.rows) {
        sqlDump += `\nALTER TABLE ${table} ADD CONSTRAINT ${pk.conname} ${pk.constraint_def};\n`;
      }

      // Foreign keys
      const fkResult = await pool.query(`
        SELECT pg_get_constraintdef(oid) as constraint_def, conname
        FROM pg_constraint
        WHERE conrelid = $1::regclass AND contype = 'f'
      `, [table]);

      for (const fk of fkResult.rows) {
        sqlDump += `\nALTER TABLE ${table} ADD CONSTRAINT ${fk.conname} ${fk.constraint_def};\n`;
      }

      // Indexes (excluding primary key indexes)
      const idxResult = await pool.query(`
        SELECT indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = $1
          AND indexdef NOT LIKE '%UNIQUE%'
      `, [table]);

      for (const idx of idxResult.rows) {
        sqlDump += `\n${idx.indexdef};\n`;
      }
    }

    sqlDump += `\n-- Backup completed at ${new Date().toISOString()}\n`;

    // Convert to buffer
    const backupData = Buffer.from(sqlDump, 'utf-8');

    // Return the backup file
    return new NextResponse(backupData, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="database-backup-${timestamp}.sql"`,
        'Content-Length': backupData.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Database backup error:', error);

    return NextResponse.json(
      { message: error.message || 'Failed to create database backup' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
