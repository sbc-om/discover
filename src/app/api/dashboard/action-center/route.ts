import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/session';

export interface ActionItem {
  id: string;
  type: 'health_test' | 'medal_request' | 'payment_pending' | 'user_approval' | 'program_inactive';
  title: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
  overdueCount?: number;
  dueTodayCount?: number;
  link: string;
  metadata?: Record<string, any>;
}

export interface ActionCenterResponse {
  role: 'admin' | 'academy_manager';
  totalPendingActions: number;
  highPriorityCount: number;
  actions: ActionItem[];
  summary: {
    message: string;
    messageAr: string;
  };
}

export async function GET() {
  try {
    const session = await requireAuth();
    const actions: ActionItem[] = [];

    if (session.roleName === 'admin') {
      // Admin sees global system-wide actions
      const [
        pendingHealthTests,
        overdueHealthTests,
        pendingMedalRequests,
        overdueMedalRequests,
        inactiveAcademiesWithUsers,
        usersWithoutAcademy,
      ] = await Promise.all([
        pool.query(
          `SELECT COUNT(*)::int as count FROM health_tests WHERE status = 'pending'`
        ),
        pool.query(
          `SELECT COUNT(*)::int as count 
           FROM health_tests 
           WHERE status = 'pending' 
           AND created_at < NOW() - INTERVAL '7 days'`
        ),
        pool.query(
          `SELECT COUNT(*)::int as count FROM medal_requests WHERE status = 'pending'`
        ),
        pool.query(
          `SELECT COUNT(*)::int as count 
           FROM medal_requests 
           WHERE status = 'pending' 
           AND created_at < NOW() - INTERVAL '7 days'`
        ),
        pool.query(
          `SELECT COUNT(*)::int as count 
           FROM academies a 
           WHERE a.is_active = false 
           AND EXISTS (SELECT 1 FROM users u WHERE u.academy_id = a.id)`
        ),
        pool.query(
          `SELECT COUNT(*)::int as count 
           FROM users u 
           JOIN roles r ON r.id = u.role_id 
           WHERE u.academy_id IS NULL 
           AND r.name IN ('player', 'coach', 'academy_manager')`
        ),
      ]);

      const pendingTests = pendingHealthTests.rows[0]?.count || 0;
      const overdueTests = overdueHealthTests.rows[0]?.count || 0;
      const pendingMedals = pendingMedalRequests.rows[0]?.count || 0;
      const overdueMedals = overdueMedalRequests.rows[0]?.count || 0;
      const inactiveAcads = inactiveAcademiesWithUsers.rows[0]?.count || 0;
      const orphanUsers = usersWithoutAcademy.rows[0]?.count || 0;

      if (pendingTests > 0) {
        actions.push({
          id: 'pending-health-tests',
          type: 'health_test',
          title: 'Pending Health Tests',
          count: pendingTests,
          priority: overdueTests > 0 ? 'high' : 'medium',
          overdueCount: overdueTests,
          link: '/dashboard/health-tests?status=pending',
        });
      }

      if (pendingMedals > 0) {
        actions.push({
          id: 'pending-medal-requests',
          type: 'medal_request',
          title: 'Pending Medal Requests',
          count: pendingMedals,
          priority: overdueMedals > 0 ? 'high' : 'medium',
          overdueCount: overdueMedals,
          link: '/dashboard/medal-requests?status=pending',
        });
      }

      if (inactiveAcads > 0) {
        actions.push({
          id: 'inactive-academies',
          type: 'program_inactive',
          title: 'Inactive Academies with Users',
          count: inactiveAcads,
          priority: 'low',
          link: '/dashboard/academies?status=inactive&hasUsers=true',
          metadata: { reason: 'Users assigned to inactive academies' },
        });
      }

      if (orphanUsers > 0) {
        actions.push({
          id: 'unassigned-users',
          type: 'user_approval',
          title: 'Users Without Academy',
          count: orphanUsers,
          priority: 'medium',
          link: '/dashboard/users?filter=noAcademy',
          metadata: { reason: 'Players/coaches/managers need academy assignment' },
        });
      }

      const totalActions = actions.reduce((sum, action) => sum + action.count, 0);
      const highPriorityCount = actions.filter(a => a.priority === 'high').reduce((sum, a) => sum + a.count, 0);

      let message = 'All clear! No pending actions.';
      let messageAr = 'كل شيء على ما يرام! لا توجد إجراءات معلقة.';

      if (totalActions > 0) {
        if (highPriorityCount > 0) {
          message = `${highPriorityCount} high-priority ${highPriorityCount === 1 ? 'item requires' : 'items require'} immediate attention`;
          messageAr = `${highPriorityCount} ${highPriorityCount === 1 ? 'عنصر' : 'عناصر'} عالية الأولوية تتطلب اهتمامًا فوريًا`;
        } else {
          message = `${totalActions} ${totalActions === 1 ? 'item requires' : 'items require'} attention`;
          messageAr = `${totalActions} ${totalActions === 1 ? 'عنصر يتطلب' : 'عناصر تتطلب'} الاهتمام`;
        }
      }

      return NextResponse.json({
        role: 'admin',
        totalPendingActions: totalActions,
        highPriorityCount,
        actions: actions.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }),
        summary: { message, messageAr },
      } as ActionCenterResponse);
    }

    if (session.roleName === 'academy_manager') {
      // Get academy manager's academy
      const academyResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const academyId = academyResult.rows[0]?.academy_id;

      if (!academyId) {
        return NextResponse.json({
          role: 'academy_manager',
          totalPendingActions: 0,
          highPriorityCount: 0,
          actions: [],
          summary: {
            message: 'No academy assigned',
            messageAr: 'لم يتم تعيين أكاديمية',
          },
        } as ActionCenterResponse);
      }

      // Academy Manager sees academy-specific actions
      const [
        pendingHealthTests,
        overdueHealthTests,
        pendingMedalRequests,
        overdueMedalRequests,
        usersWithoutProgram,
      ] = await Promise.all([
        pool.query(
          `SELECT COUNT(*)::int as count 
           FROM health_tests ht
           JOIN users u ON u.id = ht.user_id
           WHERE u.academy_id = $1 AND ht.status = 'pending'`,
          [academyId]
        ),
        pool.query(
          `SELECT COUNT(*)::int as count 
           FROM health_tests ht
           JOIN users u ON u.id = ht.user_id
           WHERE u.academy_id = $1 
           AND ht.status = 'pending' 
           AND ht.created_at < NOW() - INTERVAL '7 days'`,
          [academyId]
        ),
        pool.query(
          `SELECT COUNT(*)::int as count 
           FROM medal_requests mr
           JOIN users u ON u.id = mr.user_id
           WHERE u.academy_id = $1 AND mr.status = 'pending'`,
          [academyId]
        ),
        pool.query(
          `SELECT COUNT(*)::int as count 
           FROM medal_requests mr
           JOIN users u ON u.id = mr.user_id
           WHERE u.academy_id = $1 
           AND mr.status = 'pending' 
           AND mr.created_at < NOW() - INTERVAL '7 days'`,
          [academyId]
        ),
        pool.query(
          `SELECT COUNT(*)::int as count 
           FROM users u
           JOIN roles r ON r.id = u.role_id
           WHERE u.academy_id = $1 
           AND r.name = 'player'
           AND NOT EXISTS (
             SELECT 1 FROM player_programs pp WHERE pp.user_id = u.id
           )`,
          [academyId]
        ),
      ]);

      const pendingTests = pendingHealthTests.rows[0]?.count || 0;
      const overdueTests = overdueHealthTests.rows[0]?.count || 0;
      const pendingMedals = pendingMedalRequests.rows[0]?.count || 0;
      const overdueMedals = overdueMedalRequests.rows[0]?.count || 0;
      const playersNoProgram = usersWithoutProgram.rows[0]?.count || 0;

      if (pendingTests > 0) {
        actions.push({
          id: 'pending-health-tests',
          type: 'health_test',
          title: 'Pending Health Tests',
          count: pendingTests,
          priority: overdueTests > 0 ? 'high' : 'medium',
          overdueCount: overdueTests,
          link: '/dashboard/health-tests?status=pending',
        });
      }

      if (pendingMedals > 0) {
        actions.push({
          id: 'pending-medal-requests',
          type: 'medal_request',
          title: 'Pending Medal Requests',
          count: pendingMedals,
          priority: overdueMedals > 0 ? 'high' : 'medium',
          overdueCount: overdueMedals,
          link: '/dashboard/medal-requests?status=pending',
        });
      }

      if (playersNoProgram > 0) {
        actions.push({
          id: 'players-no-program',
          type: 'user_approval',
          title: 'Players Without Program',
          count: playersNoProgram,
          priority: 'medium',
          link: '/dashboard/users?filter=noProgram',
          metadata: { reason: 'Players need to be enrolled in programs' },
        });
      }

      const totalActions = actions.reduce((sum, action) => sum + action.count, 0);
      const highPriorityCount = actions.filter(a => a.priority === 'high').reduce((sum, a) => sum + a.count, 0);

      let message = 'All clear! No pending actions.';
      let messageAr = 'كل شيء على ما يرام! لا توجد إجراءات معلقة.';

      if (totalActions > 0) {
        if (highPriorityCount > 0) {
          message = `${highPriorityCount} high-priority ${highPriorityCount === 1 ? 'item requires' : 'items require'} immediate attention`;
          messageAr = `${highPriorityCount} ${highPriorityCount === 1 ? 'عنصر' : 'عناصر'} عالية الأولوية تتطلب اهتمامًا فوريًا`;
        } else {
          message = `${totalActions} ${totalActions === 1 ? 'item requires' : 'items require'} attention`;
          messageAr = `${totalActions} ${totalActions === 1 ? 'عنصر يتطلب' : 'عناصر تتطلب'} الاهتمام`;
        }
      }

      return NextResponse.json({
        role: 'academy_manager',
        totalPendingActions: totalActions,
        highPriorityCount,
        actions: actions.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }),
        summary: { message, messageAr },
      } as ActionCenterResponse);
    }

    return NextResponse.json(
      { message: 'Unauthorized role' },
      { status: 403 }
    );
  } catch (error: any) {
    console.error('Action center error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load action center' },
      { status: 500 }
    );
  }
}
