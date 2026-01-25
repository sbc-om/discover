import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');

    let query = `
      SELECT 
        ht.*, 
        u.first_name, u.last_name, u.avatar_url,
        a.name as academy_name, a.name_ar as academy_name_ar
      FROM health_tests ht
      JOIN users u ON u.id = ht.user_id
      LEFT JOIN academies a ON a.id = u.academy_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let index = 1;

    if (session.roleName === 'player') {
      query += ` AND ht.user_id = $${index}`;
      params.push(session.userId);
      index += 1;
    } else if (session.roleName === 'academy_manager') {
      // Academy managers can only see tests from their academy
      const academyResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const managerAcademyId = academyResult.rows[0]?.academy_id;
      if (managerAcademyId) {
        query += ` AND u.academy_id = $${index}`;
        params.push(managerAcademyId);
        index += 1;
      }
      
      if (userId) {
        // Additional check to ensure user is from the same academy
        query += ` AND ht.user_id = $${index}`;
        params.push(userId);
        index += 1;
      }
    } else if (userId) {
      // Admin can see any specific user's tests
      query += ` AND ht.user_id = $${index}`;
      params.push(userId);
      index += 1;
    }

    if (status) {
      query += ` AND ht.status = $${index}`;
      params.push(status);
      index += 1;
    }

    query += ' ORDER BY ht.requested_at DESC NULLS LAST, ht.created_at DESC';

    const { rows } = await pool.query(query, params);

    return NextResponse.json({ tests: rows });
  } catch (error: any) {
    console.error('Get health tests error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch health tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const targetUserId = body?.user_id || session.userId;

    if (session.roleName === 'player' && targetUserId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (session.roleName !== 'player' && !['admin', 'academy_manager', 'coach'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (session.roleName !== 'admin') {
      const accessCheck = await pool.query(
        `SELECT u.id, u.academy_id, r.name as role_name
         FROM users u
         LEFT JOIN roles r ON r.id = u.role_id
         WHERE u.id = $1`,
        [targetUserId]
      );

      if (accessCheck.rows.length === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const userAcademyId = accessCheck.rows[0].academy_id;
      const userRoleName = accessCheck.rows[0].role_name;

      if (userRoleName !== 'player') {
        return NextResponse.json({ message: 'Only players can request tests' }, { status: 400 });
      }

      if (session.roleName !== 'player') {
        const actorAcademyResult = await pool.query(
          'SELECT academy_id FROM users WHERE id = $1',
          [session.userId]
        );
        const actorAcademyId = actorAcademyResult.rows[0]?.academy_id;
        if (actorAcademyId && userAcademyId && actorAcademyId !== userAcademyId) {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
      }
    }

    const profileResult = await pool.query(
      'SELECT sport, bio FROM player_profiles WHERE user_id = $1',
      [targetUserId]
    );

    const profile = profileResult.rows[0];
    if (!profile || !profile.sport || !profile.bio) {
      return NextResponse.json(
        { message: 'Profile must be completed first' },
        { status: 400 }
      );
    }

    const academyResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [targetUserId]
    );
    const academyId = academyResult.rows[0]?.academy_id;
    if (!academyId) {
      return NextResponse.json(
        { message: 'Player must be assigned to an academy before requesting a test' },
        { status: 400 }
      );
    }

    const assignmentResult = await pool.query(
      'SELECT program_id, age_group_id FROM player_programs WHERE user_id = $1',
      [targetUserId]
    );
    const assignment = assignmentResult.rows[0];
    if (!assignment?.program_id || !assignment?.age_group_id) {
      return NextResponse.json(
        { message: 'Player must be assigned to a program and age group before requesting a test' },
        { status: 400 }
      );
    }

    const existingRequest = await pool.query(
      `SELECT id FROM health_tests
       WHERE user_id = $1 AND status IN ('pending', 'approved')
       LIMIT 1`,
      [targetUserId]
    );

    if (existingRequest.rows.length > 0) {
      return NextResponse.json(
        { message: 'There is already an active request' },
        { status: 409 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO health_tests (user_id, status, requested_at, created_by)
       VALUES ($1, 'pending', CURRENT_TIMESTAMP, $1)
       RETURNING id, status, requested_at`,
      [targetUserId]
    );

    return NextResponse.json({ test: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create health test request error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create request' },
      { status: 500 }
    );
  }
}
