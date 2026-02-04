import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// Helper to check level access
async function checkLevelAccess(levelId: string, session: any) {
  const levelResult = await pool.query(
    `SELECT pl.id, pl.program_id, p.academy_id
     FROM program_levels pl
     JOIN programs p ON p.id = pl.program_id
     WHERE pl.id = $1`,
    [levelId]
  );

  if (levelResult.rows.length === 0) {
    return { error: 'Level not found', status: 404 };
  }

  const level = levelResult.rows[0];

  if (session.roleName !== 'admin') {
    const userResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [session.userId]
    );
    const userAcademyId = userResult.rows[0]?.academy_id;
    
    if (level.academy_id !== userAcademyId) {
      return { error: 'Forbidden', status: 403 };
    }
  }

  return { level };
}

// Helper function to check granular permission
async function hasGranularPermission(session: any, action: string): Promise<boolean> {
  if (session.roleName === 'admin') return true;
  
  const { rows } = await pool.query(
    `SELECT COUNT(*) as count
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     JOIN modules m ON m.id = p.module_id
     WHERE rp.role_id = $1 AND m.name = 'programs' AND p.action = $2`,
    [session.roleId, action]
  );
  
  return parseInt(rows[0].count) > 0;
}

// GET all rewards for a level
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { levelId } = await params;
    if (!levelId) {
      return NextResponse.json({ message: 'Level ID is required' }, { status: 400 });
    }

    const access = await checkLevelAccess(levelId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const { rows } = await pool.query(
      `SELECT lr.*, a.title as achievement_title, a.title_ar as achievement_title_ar
       FROM level_rewards lr
       LEFT JOIN achievements a ON a.id = lr.achievement_id
       WHERE lr.level_id = $1
       ORDER BY lr.display_order ASC`,
      [levelId]
    );

    return NextResponse.json({ rewards: rows });
  } catch (error: any) {
    console.error('Get level rewards error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch level rewards' },
      { status: 500 }
    );
  }
}

// POST create new reward for a level
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check for manage_rewards permission
    const canManage = await hasGranularPermission(session, 'manage_rewards') ||
                      await hasGranularPermission(session, 'edit_level');
    
    if (!canManage) {
      return NextResponse.json({ message: 'You do not have permission to manage rewards' }, { status: 403 });
    }

    const { levelId } = await params;
    if (!levelId) {
      return NextResponse.json({ message: 'Level ID is required' }, { status: 400 });
    }

    const access = await checkLevelAccess(levelId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const body = await request.json();
    const {
      reward_type,
      trigger_type,
      trigger_value,
      title,
      title_ar,
      description,
      description_ar,
      badge_icon_url,
      medal_type,
      achievement_id,
      notify_player = true,
      notify_coach = true,
      notify_parent = false,
      display_order,
      is_active = true
    } = body;

    // Validation
    if (!reward_type || !['virtual', 'physical'].includes(reward_type)) {
      return NextResponse.json({ message: 'Invalid reward type' }, { status: 400 });
    }

    if (!trigger_type || !['sessions_completed', 'points_earned', 'level_completed'].includes(trigger_type)) {
      return NextResponse.json({ message: 'Invalid trigger type' }, { status: 400 });
    }

    if ((trigger_type === 'sessions_completed' || trigger_type === 'points_earned') && !trigger_value) {
      return NextResponse.json({ message: 'Trigger value is required for this trigger type' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ message: 'Reward title is required' }, { status: 400 });
    }

    // Auto-assign display_order if not provided
    let finalDisplayOrder = display_order;
    if (!finalDisplayOrder) {
      const maxOrderResult = await pool.query(
        'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM level_rewards WHERE level_id = $1',
        [levelId]
      );
      finalDisplayOrder = maxOrderResult.rows[0].next_order;
    }

    const { rows } = await pool.query(
      `INSERT INTO level_rewards (
        level_id, reward_type, trigger_type, trigger_value, title, title_ar,
        description, description_ar, badge_icon_url, medal_type, achievement_id,
        notify_player, notify_coach, notify_parent, display_order, is_active
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        levelId, reward_type, trigger_type, trigger_value, title, title_ar,
        description, description_ar, badge_icon_url, medal_type, achievement_id,
        notify_player, notify_coach, notify_parent, finalDisplayOrder, is_active
      ]
    );

    return NextResponse.json({ reward: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create level reward error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create level reward' },
      { status: 500 }
    );
  }
}
