import pool from '@/lib/db';
import webpush from 'web-push';

interface HealthTestRequestParams {
  userId: string;
  levelId: string;
  requestType: 'before_level' | 'after_level' | 'session_count';
  triggerType?: 'level_assignment' | 'level_completion' | 'session_count';
  sessionCount?: number;
  createdBy?: string;
}

interface NotifyAdminParams {
  userId: string;
  levelName: string;
  levelNameAr: string;
  programName: string;
  programNameAr: string;
  requestType: 'before_level' | 'after_level' | 'session_count';
  sessionCount?: number;
}

function getVapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

/**
 * Creates a health test request for a player when assigned to a level that requires it
 */
export async function createLevelHealthTestRequest(params: HealthTestRequestParams): Promise<{ success: boolean; healthTestId?: string; error?: string }> {
  const { userId, levelId, requestType, triggerType = 'level_assignment', sessionCount, createdBy } = params;

  try {
    // For session_count triggers, check with session count in unique constraint
    const uniqueKey = requestType === 'session_count' ? `${requestType}_${sessionCount}` : requestType;
    
    // Check if request already exists
    const existingRequest = await pool.query(
      `SELECT id, health_test_id FROM level_health_test_requests 
       WHERE user_id = $1 AND level_id = $2 AND request_type = $3
       ${requestType === 'session_count' ? 'AND triggered_at_session = $4' : ''}`,
      requestType === 'session_count' 
        ? [userId, levelId, requestType, sessionCount]
        : [userId, levelId, requestType]
    );

    if (existingRequest.rows.length > 0) {
      // Request already exists, return existing health test id
      return { success: true, healthTestId: existingRequest.rows[0].health_test_id };
    }

    // Create a new health test request
    const healthTestResult = await pool.query(
      `INSERT INTO health_tests (user_id, status, requested_at, created_by)
       VALUES ($1, 'pending', CURRENT_TIMESTAMP, $2)
       RETURNING id`,
      [userId, createdBy || userId]
    );

    const healthTestId = healthTestResult.rows[0].id;

    // Link to level health test requests with trigger info
    await pool.query(
      `INSERT INTO level_health_test_requests (user_id, level_id, health_test_id, request_type, trigger_type, triggered_at_session, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       ON CONFLICT (user_id, level_id, request_type) DO UPDATE 
       SET health_test_id = EXCLUDED.health_test_id,
           trigger_type = EXCLUDED.trigger_type,
           triggered_at_session = EXCLUDED.triggered_at_session,
           status = 'pending',
           updated_at = CURRENT_TIMESTAMP`,
      [userId, levelId, healthTestId, requestType, triggerType, sessionCount || null]
    );

    return { success: true, healthTestId };
  } catch (error: any) {
    console.error('Error creating level health test request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notifies admin users when a player requires a health test for a level
 */
export async function notifyAdminsAboutHealthTest(params: NotifyAdminParams): Promise<void> {
  const { userId, levelName, levelNameAr, programName, programNameAr, requestType, sessionCount } = params;

  try {
    // Get player info
    const playerResult = await pool.query(
      `SELECT first_name, last_name, email FROM users WHERE id = $1`,
      [userId]
    );
    const player = playerResult.rows[0];
    if (!player) return;

    const playerName = `${player.first_name || ''} ${player.last_name || ''}`.trim();

    // Get admin user IDs
    const adminResult = await pool.query(
      `SELECT u.id FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE r.name = 'admin' AND u.is_active = true`
    );

    if (adminResult.rows.length === 0) return;

    const adminIds = adminResult.rows.map((row: any) => row.id);

    // Create message content based on request type
    let requestTypeText: string;
    let requestTypeTextAr: string;
    
    if (requestType === 'before_level') {
      requestTypeText = 'before starting';
      requestTypeTextAr = 'قبل بدء';
    } else if (requestType === 'after_level') {
      requestTypeText = 'after completing';
      requestTypeTextAr = 'بعد إكمال';
    } else {
      requestTypeText = `after completing ${sessionCount} sessions in`;
      requestTypeTextAr = `بعد إكمال ${sessionCount} جلسة في`;
    }
    
    const messageEn = `Player "${playerName}" requires a health test ${requestTypeText} level "${levelName}" in program "${programName}".`;
    const messageAr = `اللاعب "${playerName}" يحتاج إلى فحص صحي ${requestTypeTextAr} المستوى "${levelNameAr || levelName}" في البرنامج "${programNameAr || programName}".`;
    
    const subject = 'Health Test Required / مطلوب فحص صحي';
    const content = `${messageEn}\n\n${messageAr}`;

    // Insert messages for each admin
    for (const adminId of adminIds) {
      await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, subject, content, is_read)
         VALUES (NULL, $1, $2, $3, false)`,
        [adminId, subject, content]
      );
    }

    // Send push notifications to admins
    const vapid = getVapidConfig();
    if (vapid) {
      webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

      const subscriptions = await pool.query(
        `SELECT id, endpoint, p256dh, auth FROM push_subscriptions
         WHERE is_active = true AND user_id = ANY($1)`,
        [adminIds]
      );

      const payload = JSON.stringify({
        title: 'Health Test Required / مطلوب فحص صحي',
        body: `${playerName} requires a health test`,
        icon: '/logo/icon-black.png',
        badge: '/logo/icon-black.png',
        url: '/dashboard/health-tests'
      });

      for (const sub of subscriptions.rows) {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          };
          await webpush.sendNotification(subscription, payload);
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await pool.query(
              'UPDATE push_subscriptions SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
              [sub.id]
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error notifying admins about health test:', error);
  }
}

/**
 * Processes health test requirements when a player is assigned to a level
 */
export async function processLevelHealthTestRequirements(
  userId: string,
  levelId: string,
  createdBy?: string
): Promise<{ beforeLevelTest?: string; afterLevelTest?: string }> {
  const result: { beforeLevelTest?: string; afterLevelTest?: string } = {};

  try {
    // Get level info including health test requirement
    const levelResult = await pool.query(
      `SELECT pl.name, pl.name_ar, pl.health_test_requirement,
              p.name as program_name, p.name_ar as program_name_ar
       FROM program_levels pl
       JOIN programs p ON p.id = pl.program_id
       WHERE pl.id = $1`,
      [levelId]
    );

    if (levelResult.rows.length === 0) {
      console.log('Level not found:', levelId);
      return result;
    }

    const level = levelResult.rows[0];
    const requirement = level.health_test_requirement || 'none';

    if (requirement === 'none') {
      return result;
    }

    // Create health test request(s) based on requirement
    if (requirement === 'before' || requirement === 'both') {
      const beforeResult = await createLevelHealthTestRequest({
        userId,
        levelId,
        requestType: 'before_level',
        createdBy
      });
      if (beforeResult.success) {
        result.beforeLevelTest = beforeResult.healthTestId;
        await notifyAdminsAboutHealthTest({
          userId,
          levelName: level.name,
          levelNameAr: level.name_ar,
          programName: level.program_name,
          programNameAr: level.program_name_ar,
          requestType: 'before_level'
        });
      }
    }

    if (requirement === 'after' || requirement === 'both') {
      const afterResult = await createLevelHealthTestRequest({
        userId,
        levelId,
        requestType: 'after_level',
        createdBy
      });
      if (afterResult.success) {
        result.afterLevelTest = afterResult.healthTestId;
        // Only notify for after_level if not "both" (to avoid duplicate notifications)
        if (requirement !== 'both') {
          await notifyAdminsAboutHealthTest({
            userId,
            levelName: level.name,
            levelNameAr: level.name_ar,
            programName: level.program_name,
            programNameAr: level.program_name_ar,
            requestType: 'after_level'
          });
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error processing level health test requirements:', error);
    return result;
  }
}

/**
 * Check if session-based health test is required after player completes a session
 * This should be called after recording attendance
 */
export async function checkSessionBasedHealthTest(
  userId: string,
  levelId: string,
  currentSessionCount: number,
  createdBy?: string
): Promise<{ triggered: boolean; healthTestId?: string }> {
  try {
    // Get level info including session-based health test requirement
    const levelResult = await pool.query(
      `SELECT pl.name, pl.name_ar, pl.health_test_after_sessions,
              p.name as program_name, p.name_ar as program_name_ar
       FROM program_levels pl
       JOIN programs p ON p.id = pl.program_id
       WHERE pl.id = $1`,
      [levelId]
    );

    if (levelResult.rows.length === 0) {
      return { triggered: false };
    }

    const level = levelResult.rows[0];
    const requiredSessions = level.health_test_after_sessions;

    // If no session-based requirement or not yet reached
    if (!requiredSessions || currentSessionCount < requiredSessions) {
      return { triggered: false };
    }

    // Check if we've already triggered for this session count
    // We only trigger when exact match (e.g., at session 10, not 11, 12, etc.)
    if (currentSessionCount !== requiredSessions) {
      return { triggered: false };
    }

    // Check if a session-based health test already exists for this count
    const existingRequest = await pool.query(
      `SELECT id, health_test_id FROM level_health_test_requests 
       WHERE user_id = $1 AND level_id = $2 AND request_type = 'session_count' 
       AND triggered_at_session = $3`,
      [userId, levelId, currentSessionCount]
    );

    if (existingRequest.rows.length > 0) {
      return { triggered: true, healthTestId: existingRequest.rows[0].health_test_id };
    }

    // Create the health test request
    const result = await createLevelHealthTestRequest({
      userId,
      levelId,
      requestType: 'session_count',
      triggerType: 'session_count',
      sessionCount: currentSessionCount,
      createdBy
    });

    if (result.success) {
      // Notify admins
      await notifyAdminsAboutHealthTest({
        userId,
        levelName: level.name,
        levelNameAr: level.name_ar,
        programName: level.program_name,
        programNameAr: level.program_name_ar,
        requestType: 'session_count',
        sessionCount: currentSessionCount
      });

      return { triggered: true, healthTestId: result.healthTestId };
    }

    return { triggered: false };
  } catch (error) {
    console.error('Error checking session-based health test:', error);
    return { triggered: false };
  }
}
