import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/session';

export async function GET() {
  try {
    const session = await requireAuth();

    if (session.roleName === 'admin') {
      const [academiesResult, usersResult, coachesResult, playersResult, testsResult, medalsResult, academyDetails] = await Promise.all([
        pool.query('SELECT COUNT(*)::int as count FROM academies'),
        pool.query('SELECT COUNT(*)::int as count FROM users'),
        pool.query(
          `SELECT COUNT(*)::int as count
           FROM users u
           JOIN roles r ON r.id = u.role_id
           WHERE r.name = 'coach'`
        ),
        pool.query(
          `SELECT COUNT(*)::int as count
           FROM users u
           JOIN roles r ON r.id = u.role_id
           WHERE r.name = 'player'`
        ),
        pool.query(`SELECT COUNT(*)::int as count FROM health_tests WHERE status = 'pending'`),
        pool.query(`SELECT COUNT(*)::int as count FROM medal_requests WHERE status = 'pending'`),
        pool.query(
          `SELECT 
            a.id, a.name, a.name_ar, a.city, a.is_active, a.logo_url,
            COUNT(DISTINCT u.id) FILTER (WHERE r.name = 'player')::int as players_count,
            COUNT(DISTINCT u.id) FILTER (WHERE r.name = 'coach')::int as coaches_count,
            COUNT(DISTINCT p.id)::int as programs_count
           FROM academies a
           LEFT JOIN users u ON u.academy_id = a.id
           LEFT JOIN roles r ON r.id = u.role_id
           LEFT JOIN programs p ON p.academy_id = a.id
           GROUP BY a.id
           ORDER BY a.created_at DESC`
        )
      ]);

      return NextResponse.json({
        role: 'admin',
        stats: {
          academies: academiesResult.rows[0]?.count || 0,
          users: usersResult.rows[0]?.count || 0,
          coaches: coachesResult.rows[0]?.count || 0,
          players: playersResult.rows[0]?.count || 0,
          pendingHealthTests: testsResult.rows[0]?.count || 0,
          pendingMedalRequests: medalsResult.rows[0]?.count || 0,
        },
        academies: academyDetails.rows || [],
      });
    }

    if (session.roleName === 'academy_manager') {
      const academyResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const academyId = academyResult.rows[0]?.academy_id;

      if (!academyId) {
        return NextResponse.json({ role: 'academy_manager', stats: null, academy: null });
      }

      const [academyInfo, coachesResult, playersResult, programsResult, testsResult, medalsResult, usersResult] = await Promise.all([
        pool.query(
          `SELECT id, name, name_ar, city, is_active, logo_url
           FROM academies
           WHERE id = $1`,
          [academyId]
        ),
        pool.query(
          `SELECT COUNT(*)::int as count
           FROM users u
           JOIN roles r ON r.id = u.role_id
           WHERE r.name = 'coach' AND u.academy_id = $1`,
          [academyId]
        ),
        pool.query(
          `SELECT COUNT(*)::int as count
           FROM users u
           JOIN roles r ON r.id = u.role_id
           WHERE r.name = 'player' AND u.academy_id = $1`,
          [academyId]
        ),
        pool.query(
          `SELECT COUNT(*)::int as count
           FROM programs
           WHERE academy_id = $1`,
          [academyId]
        ),
        pool.query(
          `SELECT COUNT(*)::int as count
           FROM health_tests ht
           JOIN users u ON u.id = ht.user_id
           WHERE u.academy_id = $1 AND ht.status = 'pending'`,
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
           FROM users
           WHERE academy_id = $1`,
          [academyId]
        )
      ]);

      return NextResponse.json({
        role: 'academy_manager',
        stats: {
          coaches: coachesResult.rows[0]?.count || 0,
          players: playersResult.rows[0]?.count || 0,
          programs: programsResult.rows[0]?.count || 0,
          pendingHealthTests: testsResult.rows[0]?.count || 0,
          pendingMedalRequests: medalsResult.rows[0]?.count || 0,
          users: usersResult.rows[0]?.count || 0,
        },
        academy: academyInfo.rows[0] || null,
      });
    }

    return NextResponse.json({ role: session.roleName, stats: null }, { status: 403 });
  } catch (error: any) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load dashboard summary' },
      { status: 500 }
    );
  }
}
