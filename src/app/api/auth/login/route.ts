import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.is_active, u.role_id, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];

    if (!user.is_active) {
      return NextResponse.json({ message: 'User is inactive' }, { status: 403 });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name || 'player'
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        roleId: user.role_id,
        roleName: user.role_name || 'player'
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: 'Unexpected error' },
      { status: 500 }
    );
  }
}
