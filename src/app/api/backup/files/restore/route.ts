import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// POST - Restore files from backup (Admin only)
export async function POST(request: Request) {
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
    const validExtensions = ['.tar.gz', '.tgz', '.zip'];
    const isValid = validExtensions.some(ext => file.name.endsWith(ext));
    
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid file type. Only .tar.gz, .tgz, or .zip files are allowed.' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const restoreDir = path.join(process.cwd(), 'backups', 'restore');
    const restorePath = path.join(restoreDir, `restore-${timestamp}${path.extname(file.name)}`);
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');

    // Create restore directory if it doesn't exist
    await fs.mkdir(restoreDir, { recursive: true });

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(restorePath, buffer);

    // Backup current uploads directory
    const backupCurrentDir = path.join(restoreDir, `uploads-backup-${timestamp}`);
    try {
      await fs.access(uploadsDir);
      await fs.cp(uploadsDir, backupCurrentDir, { recursive: true });
    } catch (error) {
      console.log('No existing uploads directory to backup');
    }

    try {
      // Remove current uploads directory
      try {
        await fs.rm(uploadsDir, { recursive: true, force: true });
      } catch (error) {
        console.log('No uploads directory to remove');
      }

      // Extract archive based on file type
      if (file.name.endsWith('.zip')) {
        // Extract zip file
        const unzipCommand = `unzip -q "${restorePath}" -d "${publicDir}"`;
        await execAsync(unzipCommand);
      } else {
        // Extract tar.gz file
        const extractCommand = `tar -xzf "${restorePath}" -C "${publicDir}"`;
        await execAsync(extractCommand);
      }

      // Clean up temporary files
      await fs.unlink(restorePath);
      
      // Remove backup of current files after successful restoration
      try {
        await fs.rm(backupCurrentDir, { recursive: true, force: true });
      } catch (error) {
        console.log('No backup directory to remove');
      }

      return NextResponse.json({
        message: 'Files restored successfully',
        success: true,
      });
    } catch (error: any) {
      // If restoration fails, restore the backup
      console.error('Restoration failed, restoring backup:', error);
      
      try {
        await fs.rm(uploadsDir, { recursive: true, force: true });
        await fs.cp(backupCurrentDir, uploadsDir, { recursive: true });
        await fs.rm(backupCurrentDir, { recursive: true, force: true });
      } catch (restoreError) {
        console.error('Failed to restore backup:', restoreError);
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Files restore error:', error);

    // Handle specific command errors
    if (error.message?.includes('tar') || error.message?.includes('unzip')) {
      return NextResponse.json(
        { message: 'Extraction tool not found. Please ensure tar or unzip is installed.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: error.message || 'Failed to restore files' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
