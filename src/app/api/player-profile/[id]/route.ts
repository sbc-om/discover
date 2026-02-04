import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

const fetchProfileData = async (userId: string) => {
  // Get basic user info and profile
  const userResult = await pool.query(
    `SELECT 
      u.id, u.first_name, u.last_name, u.avatar_url,
      a.name as academy_name, a.name_ar as academy_name_ar,
      pp.sport, pp.position, pp.bio, pp.goals
    FROM users u
    LEFT JOIN academies a ON a.id = u.academy_id
    LEFT JOIN player_profiles pp ON pp.user_id = u.id
    WHERE u.id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  // Get ALL program assignments for the player
  const programsResult = await pool.query(
    `SELECT 
      pr.id as assignment_id, pr.program_id, pr.age_group_id, pr.level_id, 
      pr.is_primary, pr.status as enrollment_status, pr.assigned_at,
      p.name as program_name, p.name_ar as program_name_ar, p.image_url as program_image,
      pag.name as age_group_name, pag.name_ar as age_group_name_ar, pag.min_age, pag.max_age,
      pl.name as level_name, pl.name_ar as level_name_ar, pl.level_order as assigned_level_order,
      pl.image_url as level_image, pl.min_sessions as level_min_sessions, pl.min_points as level_min_points
    FROM player_programs pr
    JOIN programs p ON p.id = pr.program_id
    LEFT JOIN program_age_groups pag ON pag.id = pr.age_group_id
    LEFT JOIN program_levels pl ON pl.id = pr.level_id
    WHERE pr.user_id = $1
    ORDER BY pr.is_primary DESC, pr.assigned_at DESC`,
    [userId]
  );

  // Get levels and progress for each program
  const programsWithDetails = await Promise.all(
    programsResult.rows.map(async (prog: any) => {
      // Get all levels for this program
      const levelsResult = await pool.query(
        `SELECT id, name, name_ar, image_url, level_order, min_sessions, min_points, health_test_requirement, is_active
         FROM program_levels
         WHERE program_id = $1 AND is_active = true
         ORDER BY level_order ASC`,
        [prog.program_id]
      );

      // Get attendance/progress for this program
      const attendanceResult = await pool.query(
        `SELECT attendance_date, present, score, notes
         FROM program_attendance
         WHERE user_id = $1 AND program_id = $2
         ORDER BY attendance_date DESC
         LIMIT 20`,
        [userId, prog.program_id]
      );

      // Calculate progress stats
      const attendance = attendanceResult.rows || [];
      const sessionsCompleted = attendance.filter((r: any) => r.present).length;
      const pointsTotal = attendance.reduce((sum: number, r: any) => sum + (r.score || 0), 0);

      return {
        assignment_id: prog.assignment_id,
        program_id: prog.program_id,
        program_name: prog.program_name,
        program_name_ar: prog.program_name_ar,
        program_image: prog.program_image,
        age_group_id: prog.age_group_id,
        age_group_name: prog.age_group_name,
        age_group_name_ar: prog.age_group_name_ar,
        min_age: prog.min_age,
        max_age: prog.max_age,
        level_id: prog.level_id,
        level_name: prog.level_name,
        level_name_ar: prog.level_name_ar,
        level_image: prog.level_image,
        assigned_level_order: prog.assigned_level_order,
        level_min_sessions: prog.level_min_sessions,
        level_min_points: prog.level_min_points,
        is_primary: prog.is_primary,
        enrollment_status: prog.enrollment_status,
        assigned_at: prog.assigned_at,
        levels: levelsResult.rows,
        progress: {
          sessions_completed: sessionsCompleted,
          points_earned: pointsTotal,
          notes_count: attendance.filter((r: any) => r.notes).length
        },
        recent_attendance: attendance.slice(0, 10)
      };
    })
  );

  // Find primary program for backward compatibility
  const primaryProgram = programsWithDetails.find((p: any) => p.is_primary) || programsWithDetails[0] || null;

  const latestTestResult = await pool.query(
    `SELECT id, status, requested_at, scheduled_at, test_date, height, weight,
      blood_pressure, heart_rate, notes, review_notes, speed_score, agility_score, power_score,
      balance_score, reaction_score, coordination_score, flexibility_score
     FROM health_tests
     WHERE user_id = $1
     ORDER BY requested_at DESC NULLS LAST, created_at DESC
     LIMIT 1`,
    [userId]
  );

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

  // Get overall attendance for backward compatibility
  const overallAttendanceResult = await pool.query(
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

  const achievementsResult = await pool.query(
    `SELECT pa.id, pa.awarded_at, pa.note,
            a.id as achievement_id, a.title, a.title_ar, a.description, a.icon_url
     FROM player_achievements pa
     JOIN achievements a ON a.id = pa.achievement_id
     WHERE pa.user_id = $1
     ORDER BY pa.awarded_at DESC`,
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
    // All programs the player is enrolled in
    programs: programsWithDetails,
    // Primary program for backward compatibility
    assignment: primaryProgram ? {
      program_id: primaryProgram.program_id,
      program_name: primaryProgram.program_name,
      program_name_ar: primaryProgram.program_name_ar,
      age_group_id: primaryProgram.age_group_id,
      age_group_name: primaryProgram.age_group_name,
      age_group_name_ar: primaryProgram.age_group_name_ar,
      min_age: primaryProgram.min_age,
      max_age: primaryProgram.max_age,
      level_id: primaryProgram.level_id,
      level_name: primaryProgram.level_name,
      level_name_ar: primaryProgram.level_name_ar,
      assigned_level_order: primaryProgram.assigned_level_order,
      assigned_at: primaryProgram.assigned_at,
    } : null,
    // Primary program levels for backward compatibility
    program_levels: primaryProgram?.levels || [],
    latestTest: latestTestResult.rows[0] || null,
    activeRequest: activeRequestResult.rows[0] || null,
    medalRequest: latestMedalRequestResult.rows[0] || null,
    achievements: achievementsResult.rows || [],
    messages: messagesResult.rows || [],
    attendance: overallAttendanceResult.rows || [],
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!['admin', 'academy_manager', 'coach'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'User id is required' }, { status: 400 });
    }

    if (session.roleName !== 'admin') {
      const academyResult = await pool.query(
        `SELECT academy_id FROM users WHERE id = $1`,
        [session.userId]
      );
      const actorAcademyId = academyResult.rows[0]?.academy_id;

      const targetAcademyResult = await pool.query(
        `SELECT academy_id FROM users WHERE id = $1`,
        [id]
      );
      const targetAcademyId = targetAcademyResult.rows[0]?.academy_id;

      if (!actorAcademyId || actorAcademyId !== targetAcademyId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    const data = await fetchProfileData(id);
    if (!data) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get player profile by id error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!['admin', 'academy_manager', 'coach'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'User id is required' }, { status: 400 });
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
      [id, sport, position || null, bio, goals || null]
    );

    const profile = rows[0];
    const profileComplete = Boolean(profile.sport && profile.bio);

    return NextResponse.json({ profile, profileComplete });
  } catch (error: any) {
    console.error('Update player profile by id error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
