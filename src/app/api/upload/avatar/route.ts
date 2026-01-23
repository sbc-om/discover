import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');
const ACADEMY_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'academies');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = (formData.get('type') as string | null) || 'avatar';
    const file = (formData.get('file') || formData.get('avatar')) as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (type !== 'academy' && !userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = type === 'academy' ? ACADEMY_UPLOAD_DIR : AVATAR_UPLOAD_DIR;
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate secure filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const hash = crypto.randomBytes(16).toString('hex');
    const filename = type === 'academy'
      ? `academy-${hash}.${ext}`
      : `${userId}-${hash}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Basic image validation (check magic bytes)
    if (!isValidImage(buffer, file.type)) {
      return NextResponse.json(
        { message: 'Invalid image file' },
        { status: 400 }
      );
    }

    await writeFile(filepath, buffer);

    const url = type === 'academy'
      ? `/uploads/academies/${filename}`
      : `/uploads/avatars/${filename}`;

    return NextResponse.json({
      success: true,
      avatarUrl: type === 'academy' ? undefined : url,
      url: type === 'academy' ? url : undefined,
      message: type === 'academy' ? 'Academy logo uploaded successfully' : 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { message: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

// Validate image by checking magic bytes
function isValidImage(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  const signatures: { [key: string]: number[][] } = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header for WebP
  };

  const expectedSignatures = signatures[mimeType];
  if (!expectedSignatures) return false;

  return expectedSignatures.some(sig =>
    sig.every((byte, index) => buffer[index] === byte)
  );
}
