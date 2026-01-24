import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

const fetchProfileData = async (userId: string) => {
  const userResult = await pool.query(
    `SELECT 
      u.id, u.first_name, u.last_name, u.avatar_url,
      a.name as academy_name, a.name_ar as academy_name_ar,
      pp.sport, pp.position, pp.bio, pp.goals,
      pr.program_id, pr.age_group_id, pr.assigned_at,
      p.name as program_name, p.name_ar as program_name_ar,
      pag.name as age_group_name, pag.name_ar as age_group_name_ar,
      pag.min_age, pag.max_age
    FROM users u
    LEFT JOIN academies a ON a.id = u.academy_id
    LEFT JOIN player_profiles pp ON pp.user_id = u.id
    LEFT JOIN player_programs pr ON pr.user_id = u.id
    LEFT JOIN programs p ON p.id = pr.program_id
    LEFT JOIN program_age_groups pag ON pag.id = pr.age_group_id
    WHERE u.id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const latestTestResult = await pool.query(
    `SELECT id, status, requested_at, scheduled_at, test_date, height, weight,
            blood_pressure, heart_rate, notes, review_notes, speed_score, agility_score, power_score
     FROM health_tests
     WHERE user_id = $1
     ORDER BY requested_at DESC NULLS LAST, created_at DESC
     LIMIT 1`,
    [userId]
  );

  let programLevels: any[] = [];
  if (userResult.rows[0]?.program_id) {
    const levelsResult = await pool.query(
      `SELECT id, name, name_ar, image_url, level_order, min_sessions, min_points, is_active
       FROM program_levels
       WHERE program_id = $1
       ORDER BY level_order ASC`,
      [userResult.rows[0].program_id]
    );
    programLevels = levelsResult.rows;
  }

  const activeRequestResult = await pool.query(
    `SELECT id, status, requested_at, scheduled_at, review_notes
     FROM health_tests
     WHERE user_id = $1 AND status IN ('pending', 'approved')
     ORDER BY requested_at DESC NULLS LAST, created_at DESC
     LIMIT 1`,
    [userId]
  );

  const latestMedalRequestResult = await pool.query(
    `SELECT id, medal_type, status, requested_date, delivery_date
     FROM medal_requests
     WHERE user_id = $1
     ORDER BY requested_date DESC NULLS LAST, created_at DESC
     LIMIT 1`,
    [userId]
  );

  const attendanceResult = await pool.query(
    `SELECT attendance_date, present, score, notes
     FROM program_attendance
     WHERE user_id = $1
     ORDER BY attendance_date DESC
     LIMIT 10`,
    [userId]
  );

  const messagesResult = await pool.query(
    `SELECT m.id, m.subject, m.content, m.is_read, m.created_at,
            u.first_name as sender_first_name, u.last_name as sender_last_name
     FROM messages m
     LEFT JOIN users u ON u.id = m.sender_id
     WHERE m.receiver_id = $1
     ORDER BY m.created_at DESC
     LIMIT 10`,
    [userId]
  );

  const user = userResult.rows[0];
  const profile = {
    sport: user.sport,
    position: user.position,
    bio: user.bio,
    goals: user.goals,
  };
  const profileComplete = Boolean(profile.sport && profile.bio);

  return {
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      academy_name: user.academy_name,
      academy_name_ar: user.academy_name_ar,
    },
    profile: profile.sport || profile.position || profile.bio || profile.goals ? profile : null,
    profileComplete,
    assignment: user.program_id
      ? {
          program_id: user.program_id,
          program_name: user.program_name,
          program_name_ar: user.program_name_ar,
          age_group_id: user.age_group_id,
          age_group_name: user.age_group_name,
          age_group_name_ar: user.age_group_name_ar,
          min_age: user.min_age,
          max_age: user.max_age,
          assigned_at: user.assigned_at,
        }
      : null,
    program_levels: programLevels,
    latestTest: latestTestResult.rows[0] || null,
    activeRequest: activeRequestResult.rows[0] || null,
    medalRequest: latestMedalRequestResult.rows[0] || null,
    messages: messagesResult.rows || [],
    attendance: attendanceResult.rows || [],
  };
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only players have player profiles
    if (session.roleName !== 'player') {
      return NextResponse.json({ message: 'Only players have profiles' }, { status: 403 });
    }

    const data = await fetchProfileData(session.userId);
    if (!data) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get player profile error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load profile' },
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

    // Only players can update their own profile
    if (session.roleName !== 'player') {
      return NextResponse.json({ message: 'Only players have profiles' }, { status: 403 });
    }

    const body = await request.json();
    const { sport, position, bio, goals } = body;

    if (!sport || !bio) {
      return NextResponse.json(
        { message: 'Sport and bio are required' },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO player_profiles (user_id, sport, position, bio, goals)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET sport = EXCLUDED.sport,
                     position = EXCLUDED.position,
                     bio = EXCLUDED.bio,
                     goals = EXCLUDED.goals,
                     updated_at = CURRENT_TIMESTAMP
       RETURNING sport, position, bio, goals`,
      [session.userId, sport, position || null, bio, goals || null]
    );

    const profile = rows[0];
    const profileComplete = Boolean(profile.sport && profile.bio);

    return NextResponse.json({ profile, profileComplete });
  } catch (error: any) {
    console.error('Save player profile error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to save profile' },
      { status: 500 }
    );
  }
}
