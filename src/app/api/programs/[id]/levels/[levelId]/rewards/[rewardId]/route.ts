import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// Helper to check reward access
async function checkRewardAccess(rewardId: string, session: any) {
  const rewardResult = await pool.query(
    `SELECT lr.id, lr.level_id, pl.program_id, p.academy_id
     FROM level_rewards lr
     JOIN program_levels pl ON pl.id = lr.level_id
     JOIN programs p ON p.id = pl.program_id
     WHERE lr.id = $1`,
    [rewardId]
  );

  if (rewardResult.rows.length === 0) {
    return { error: 'Reward not found', status: 404 };
  }

  const reward = rewardResult.rows[0];

  if (session.roleName !== 'admin') {
    const userResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [session.userId]
    );
    const userAcademyId = userResult.rows[0]?.academy_id;
    
    if (reward.academy_id !== userAcademyId) {
      return { error: 'Forbidden', status: 403 };
    }
  }

  return { reward };
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

// GET single reward
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string; rewardId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { rewardId } = await params;
    if (!rewardId) {
      return NextResponse.json({ message: 'Reward ID is required' }, { status: 400 });
    }

    const access = await checkRewardAccess(rewardId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const { rows } = await pool.query(
      `SELECT lr.*, a.title as achievement_title, a.title_ar as achievement_title_ar
       FROM level_rewards lr
       LEFT JOIN achievements a ON a.id = lr.achievement_id
       WHERE lr.id = $1`,
      [rewardId]
    );

    return NextResponse.json({ reward: rows[0] });
  } catch (error: any) {
    console.error('Get level reward error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch level reward' },
      { status: 500 }
    );
  }
}

// PUT update reward
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string; rewardId: string }> }
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

    const { rewardId } = await params;
    if (!rewardId) {
      return NextResponse.json({ message: 'Reward ID is required' }, { status: 400 });
    }

    const access = await checkRewardAccess(rewardId, session);
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
      notify_player,
      notify_coach,
      notify_parent,
      display_order,
      is_active
    } = body;

    // Validation
    if (reward_type && !['virtual', 'physical'].includes(reward_type)) {
      return NextResponse.json({ message: 'Invalid reward type' }, { status: 400 });
    }

    if (trigger_type && !['sessions_completed', 'points_earned', 'level_completed'].includes(trigger_type)) {
      return NextResponse.json({ message: 'Invalid trigger type' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `UPDATE level_rewards
       SET reward_type = COALESCE($1, reward_type),
           trigger_type = COALESCE($2, trigger_type),
           trigger_value = COALESCE($3, trigger_value),
           title = COALESCE($4, title),
           title_ar = COALESCE($5, title_ar),
           description = COALESCE($6, description),
           description_ar = COALESCE($7, description_ar),
           badge_icon_url = COALESCE($8, badge_icon_url),
           medal_type = COALESCE($9, medal_type),
           achievement_id = $10,
           notify_player = COALESCE($11, notify_player),
           notify_coach = COALESCE($12, notify_coach),
           notify_parent = COALESCE($13, notify_parent),
           display_order = COALESCE($14, display_order),
           is_active = COALESCE($15, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $16
       RETURNING *`,
      [
        reward_type, trigger_type, trigger_value, title, title_ar,
        description, description_ar, badge_icon_url, medal_type, achievement_id,
        notify_player, notify_coach, notify_parent, display_order, is_active,
        rewardId
      ]
    );

    return NextResponse.json({ reward: rows[0] });
  } catch (error: any) {
    console.error('Update level reward error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update level reward' },
      { status: 500 }
    );
  }
}

// DELETE reward
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string; rewardId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check for manage_rewards permission
    const canManage = await hasGranularPermission(session, 'manage_rewards') ||
                      await hasGranularPermission(session, 'delete_level');
    
    if (!canManage) {
      return NextResponse.json({ message: 'You do not have permission to manage rewards' }, { status: 403 });
    }

    const { rewardId } = await params;
    if (!rewardId) {
      return NextResponse.json({ message: 'Reward ID is required' }, { status: 400 });
    }

    const access = await checkRewardAccess(rewardId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    // Check if any players have received this reward
    const awardedRewards = await pool.query(
      'SELECT COUNT(*) as count FROM player_rewards WHERE level_reward_id = $1',
      [rewardId]
    );

    if (parseInt(awardedRewards.rows[0].count) > 0) {
      // Soft delete by setting is_active to false
      await pool.query(
        'UPDATE level_rewards SET is_active = false WHERE id = $1',
        [rewardId]
      );
      return NextResponse.json({ 
        message: 'Reward deactivated (cannot delete as it has been awarded to players)',
        deactivated: true 
      });
    }

    await pool.query('DELETE FROM level_rewards WHERE id = $1', [rewardId]);

    return NextResponse.json({ message: 'Reward deleted successfully' });
  } catch (error: any) {
    console.error('Delete level reward error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete level reward' },
      { status: 500 }
    );
  }
}
