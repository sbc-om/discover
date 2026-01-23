import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// POST - Create files backup (Admin only)
export async function POST() {
  try {
    await requireRole(['admin']);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', 'files');
    const backupPath = path.join(backupDir, `files-backup-${timestamp}.tar.gz`);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // Create backups directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });

    // Check if uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      return NextResponse.json(
        { message: 'No uploads directory found' },
        { status: 404 }
      );
    }

    // Create tar.gz archive of uploads directory
    const tarCommand = `tar -czf "${backupPath}" -C "${path.join(process.cwd(), 'public')}" uploads`;

    await execAsync(tarCommand);

    // Read the backup file
    const backupData = await fs.readFile(backupPath);

    // Get file stats for metadata
    const stats = await fs.stat(backupPath);

    // Clean up the temporary file
    await fs.unlink(backupPath);

    // Return the backup file
    return new NextResponse(backupData, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="files-backup-${timestamp}.tar.gz"`,
        'Content-Length': stats.size.toString(),
      },
    });
  } catch (error: any) {
    console.error('Files backup error:', error);

    // Handle specific tar errors
    if (error.message?.includes('tar')) {
      return NextResponse.json(
        { message: 'tar command not found. Please ensure tar is installed.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: error.message || 'Failed to create files backup' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
