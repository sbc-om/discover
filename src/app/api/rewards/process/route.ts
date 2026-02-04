import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

/**
 * Award Processing Service
 * This endpoint processes automatic reward awards for players based on their progress
 * Can be called:
 * 1. After each session is recorded (webhook/trigger)
 * 2. Periodically via cron job
 * 3. Manually by admin
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

  // Get player's progress for this level
  const progressResult = await client.query(
    `SELECT * FROM player_level_progress WHERE user_id = $1 AND level_id = $2`,
    [userId, levelId]
  );

  if (progressResult.rows.length === 0) {
    return results;
  }

  const progress = progressResult.rows[0];

  // Get all active rewards for this level that the player hasn't received yet
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

    // Check if trigger condition is met
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

// Award a specific reward to a player
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
      // Create a medal request for physical medals
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
      // Create a player achievement if linked to an achievement
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

    // Record the player reward
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

// POST - Process awards for a specific player (or all players in a level)
export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, levelId, processAll = false } = body;

    if (!levelId) {
      return NextResponse.json({ message: 'Level ID is required' }, { status: 400 });
    }

    await client.query('BEGIN');

    const results: AwardResult[] = [];

    if (processAll) {
      // Process all players in this level (admin only)
      if (session.roleName !== 'admin') {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Only admin can process all players' }, { status: 403 });
      }

      const playersResult = await client.query(
        `SELECT DISTINCT user_id FROM player_level_progress WHERE level_id = $1`,
        [levelId]
      );

      for (const player of playersResult.rows) {
        const playerResults = await processPlayerLevelRewards(player.user_id, levelId, client);
        results.push(...playerResults);
      }
    } else if (userId) {
      // Process specific player
      const playerResults = await processPlayerLevelRewards(userId, levelId, client);
      results.push(...playerResults);
    } else {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'userId or processAll is required' }, { status: 400 });
    }

    await client.query('COMMIT');

    return NextResponse.json({
      message: `Processed ${results.length} awards`,
      awards: results
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Process awards error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to process awards' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// GET - Get award status for a player
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.userId;
    const levelId = searchParams.get('levelId');

    let query = `
      SELECT pr.*, lr.title, lr.title_ar, lr.reward_type, lr.trigger_type,
             lr.badge_icon_url, lr.medal_type, pl.name as level_name, pl.name_ar as level_name_ar
      FROM player_rewards pr
      JOIN level_rewards lr ON lr.id = pr.level_reward_id
      JOIN program_levels pl ON pl.id = pr.level_id
      WHERE pr.user_id = $1
    `;
    const params: any[] = [userId];

    if (levelId) {
      query += ' AND pr.level_id = $2';
      params.push(levelId);
    }

    query += ' ORDER BY pr.awarded_at DESC';

    const { rows } = await pool.query(query, params);

    return NextResponse.json({ awards: rows });
  } catch (error: any) {
    console.error('Get awards error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch awards' },
      { status: 500 }
    );
  }
}
