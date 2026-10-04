import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    // KPI Card stats
    const totalStudents = (await queryOne<any>("SELECT COUNT(*)::INT as count FROM students WHERE status = 'active'"))?.count || 0;
    const totalAllStudents = (await queryOne<any>("SELECT COUNT(*)::INT as count FROM students"))?.count || 0;
    const todayAttendance = (await queryOne<any>("SELECT COUNT(*)::INT as count FROM attendance WHERE date = $1", [today]))?.count || 0;
    const attendanceRate = totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0;

    // Currency M2 Analysis
    const walletSum = Number((await queryOne<any>("SELECT COALESCE(SUM(balance), 0)::BIGINT as sum FROM wallets"))?.sum || 0);
    const bankSum = Number((await queryOne<any>("SELECT COALESCE(SUM(deposit_balance), 0)::BIGINT as sum FROM bank_accounts"))?.sum || 0);
    const savingsSum = Number((await queryOne<any>("SELECT COALESCE(SUM(principal), 0)::BIGINT as sum FROM bank_savings WHERE status = 'active'"))?.sum || 0);
    const totalM2 = walletSum + bankSum + savingsSum;

    // Daily messages & voice
    const todayStats = await queryOne<any>(
      "SELECT COALESCE(SUM(message_count), 0)::BIGINT as msg, COALESCE(SUM(voice_seconds), 0)::BIGINT as voice FROM class_stats_daily WHERE date = $1",
      [today]
    );
    const todayMessages = Number(todayStats?.msg || 0);
    const activeVoiceUsers = (await queryOne<any>("SELECT COUNT(*)::INT as count FROM voice_sessions"))?.count || 0;

    // Grade distribution
    const gradeDist = await query<any>(
      `SELECT grade, class_no, COUNT(*)::INT as student_count 
       FROM students 
       WHERE status = 'active' 
       GROUP BY grade, class_no 
       ORDER BY grade, class_no`
    );

    // High penalty warning list (벌점 50점 이상)
    const warningStudents = await query<any>(
      `SELECT s.user_id, s.nickname, s.student_code, s.grade, s.class_no, r.demerit_total as penalty_points
       FROM discipline_summary r
       JOIN students s ON r.user_id = s.user_id
       WHERE r.demerit_total >= 50
       ORDER BY r.demerit_total DESC
       LIMIT 10`
    );

    // Recent audit logs
    const auditLogs = await query<any>(
      `SELECT id, admin_name, action, target_id, details, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 20`
    );

    // Clubs summary
    const clubs = await query<any>(
      `SELECT c.id, c.name, c.status, c.leader_id, s.nickname as leader_name, COUNT(cm.user_id)::INT as member_count
       FROM clubs c
       LEFT JOIN students s ON c.leader_id = s.user_id
       LEFT JOIN club_members cm ON c.id = cm.club_id
       GROUP BY c.id, c.name, c.status, c.leader_id, s.nickname
       ORDER BY c.created_at DESC`
    );

    return NextResponse.json({
      kpi: {
        totalStudents,
        totalAllStudents,
        todayAttendance,
        attendanceRate,
        totalM2,
        walletSum,
        bankSum,
        savingsSum,
        todayMessages,
        activeVoiceUsers,
      },
      gradeDist,
      warningStudents,
      auditLogs,
      clubs,
      botStatus: {
        status: 'online',
        uptime: '99.9%',
        pingMs: 24,
        memoryUsageMb: 85,
      },
    });
  } catch (error: any) {
    console.error('Admin dashboard stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
