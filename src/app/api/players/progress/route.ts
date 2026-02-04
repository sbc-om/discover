import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

/**
 * Player Progress API
 * Tracks player progress in levels (sessions completed, points earned)
 * Automatically checks and awards rewards when progress is updated
 */

interface AwardResult {
  userId: string;
  rewardId: string;
  rewardTitle: string;
  rewardType: 'virtual' | 'physical';
  status: 'awarded' | 'pending_delivery';
}

// Check and award rewards for a specific player and level
async function processPlayerLevelRewards(
  userId: string,
  levelId: string,
  client: any
): Promise<AwardResult[]> {
  const results: AwardResult[] = [];

  const progressResult = await client.query(
    `SELECT * FROM player_level_progress WHERE user_id = $1 AND level_id = $2`,
    [userId, levelId]
  );

  if (progressResult.rows.length === 0) {
    return results;
  }

  const progress = progressResult.rows[0];

  const rewardsResult = await client.query(
    `SELECT lr.* FROM level_rewards lr
     WHERE lr.level_id = $1 
     AND lr.is_active = true
     AND lr.id NOT IN (
       SELECT level_reward_id FROM player_rewards WHERE user_id = $2
     )`,
    [levelId, userId]
  );

  for (const reward of rewardsResult.rows) {
    let shouldAward = false;

    switch (reward.trigger_type) {
      case 'sessions_completed':
        shouldAward = progress.sessions_completed >= reward.trigger_value;
        break;
      case 'points_earned':
        shouldAward = progress.points_earned >= reward.trigger_value;
        break;
      case 'level_completed':
        shouldAward = progress.level_completed === true;
        break;
    }

    if (shouldAward) {
      const awardResult = await awardRewardToPlayer(userId, reward, client);
      if (awardResult) {
        results.push(awardResult);
      }
    }
  }

  return results;
}

async function awardRewardToPlayer(
  userId: string,
  reward: any,
  client: any
): Promise<AwardResult | null> {
  try {
    let medalRequestId = null;
    let playerAchievementId = null;
    let status: 'awarded' | 'pending_delivery' = 'awarded';

    if (reward.reward_type === 'physical') {
      const medalResult = await client.query(
        `INSERT INTO medal_requests (user_id, medal_type, achievement_description, status, requested_date)
         VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
         RETURNING id`,
        [userId, reward.medal_type || 'participation', reward.title]
      );
      medalRequestId = medalResult.rows[0].id;
      status = 'pending_delivery';
    }

    if (reward.reward_type === 'virtual' || reward.achievement_id) {
      if (reward.achievement_id) {
        const achievementResult = await client.query(
          `INSERT INTO player_achievements (user_id, achievement_id, note, awarded_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id, achievement_id) DO NOTHING
           RETURNING id`,
          [userId, reward.achievement_id, `Auto-awarded for completing level reward: ${reward.title}`]
        );
        if (achievementResult.rows.length > 0) {
          playerAchievementId = achievementResult.rows[0].id;
        }
      }
    }

    await client.query(
      `INSERT INTO player_rewards (
        user_id, level_reward_id, level_id, status,
        medal_request_id, player_achievement_id, awarded_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [userId, reward.id, reward.level_id, status, medalRequestId, playerAchievementId]
    );

    return {
      userId,
      rewardId: reward.id,
      rewardTitle: reward.title,
      rewardType: reward.reward_type,
      status
    };
  } catch (error) {
    console.error('Error awarding reward:', error);
    return null;
  }
}

// GET - Get player progress for a level
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.userId;
    const levelId = searchParams.get('levelId');
    const programId = searchParams.get('programId');

    let query = `
      SELECT plp.*, pl.name as level_name, pl.name_ar as level_name_ar,
             pl.min_sessions, pl.min_points, pl.image_url as level_image,
             p.name as program_name, p.name_ar as program_name_ar
      FROM player_level_progress plp
      JOIN program_levels pl ON pl.id = plp.level_id
      JOIN programs p ON p.id = plp.program_id
      WHERE plp.user_id = $1
    `;
    const params: any[] = [userId];

    if (levelId) {
      query += ` AND plp.level_id = $${params.length + 1}`;
      params.push(levelId);
    }

    if (programId) {
      query += ` AND plp.program_id = $${params.length + 1}`;
      params.push(programId);
    }

    query += ' ORDER BY plp.last_activity_at DESC';

    const { rows } = await pool.query(query, params);

    // Get rewards progress for each level
    for (const progress of rows) {
      const rewardsResult = await pool.query(
        `SELECT lr.*, 
                CASE WHEN pr.id IS NOT NULL THEN true ELSE false END as is_earned,
                pr.awarded_at, pr.status as award_status
         FROM level_rewards lr
         LEFT JOIN player_rewards pr ON pr.level_reward_id = lr.id AND pr.user_id = $1
         WHERE lr.level_id = $2 AND lr.is_active = true
         ORDER BY lr.display_order ASC`,
        [userId, progress.level_id]
      );
      progress.rewards = rewardsResult.rows;
    }

    return NextResponse.json({ progress: rows });
  } catch (error: any) {
    console.error('Get player progress error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch player progress' },
      { status: 500 }
    );
  }
}

// POST - Update player progress (and auto-award rewards)
export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only coaches and admins can update player progress
    if (!['admin', 'coach', 'academy_manager'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Unauthorized to update player progress' }, { status: 403 });
    }

    const body = await request.json();
    const {
      userId,
      levelId,
      programId,
      sessionsToAdd = 0,
      pointsToAdd = 0,
      markCompleted = false
    } = body;

    if (!userId || !levelId || !programId) {
      return NextResponse.json({ message: 'userId, levelId, and programId are required' }, { status: 400 });
    }

    await client.query('BEGIN');

    // Get or create player progress
    let progressResult = await client.query(
      `SELECT * FROM player_level_progress WHERE user_id = $1 AND level_id = $2`,
      [userId, levelId]
    );

    let progress;
    if (progressResult.rows.length === 0) {
      // Create new progress record
      const insertResult = await client.query(
        `INSERT INTO player_level_progress (user_id, level_id, program_id, sessions_completed, points_earned)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, levelId, programId, sessionsToAdd, pointsToAdd]
      );
      progress = insertResult.rows[0];
    } else {
      // Update existing progress
      const updateResult = await client.query(
        `UPDATE player_level_progress
         SET sessions_completed = sessions_completed + $1,
             points_earned = points_earned + $2,
             level_completed = CASE WHEN $3 THEN true ELSE level_completed END,
             completed_at = CASE WHEN $3 AND completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END,
             last_activity_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4 AND level_id = $5
         RETURNING *`,
        [sessionsToAdd, pointsToAdd, markCompleted, userId, levelId]
      );
      progress = updateResult.rows[0];
    }

    // Check level requirements to auto-mark as completed
    const levelResult = await client.query(
      `SELECT min_sessions, min_points FROM program_levels WHERE id = $1`,
      [levelId]
    );
    
    if (levelResult.rows.length > 0) {
      const level = levelResult.rows[0];
      const meetsRequirements = 
        progress.sessions_completed >= level.min_sessions &&
        progress.points_earned >= level.min_points;
      
      if (meetsRequirements && !progress.level_completed) {
        await client.query(
          `UPDATE player_level_progress
           SET level_completed = true, completed_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 AND level_id = $2`,
          [userId, levelId]
        );
        progress.level_completed = true;
      }
    }

    // Process automatic rewards
    const awardedRewards = await processPlayerLevelRewards(userId, levelId, client);

    await client.query('COMMIT');

    return NextResponse.json({
      progress,
      awardedRewards,
      message: awardedRewards.length > 0 
        ? `Progress updated and ${awardedRewards.length} reward(s) earned!`
        : 'Progress updated successfully'
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Update player progress error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update player progress' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
