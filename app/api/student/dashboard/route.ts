import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const userId = BigInt(session.userId);

  try {
    const studentRow = await queryOne<any>(
      `SELECT s.user_id,
              s.nickname as real_name,
              s.grade,
              s.class_no as class_num,
              s.student_no as student_num,
              s.student_code as student_id,
              s.status,
              s.created_at as enrolled_at,
              s.intro_json,
              c.name as club_name
       FROM students s 
       LEFT JOIN club_members cm ON s.user_id = cm.user_id
       LEFT JOIN clubs c ON cm.club_id = c.id 
       WHERE s.user_id = $1`,
      [userId]
    );

    let student = null;
    if (studentRow) {
      let introData: any = {};
      if (studentRow.intro_json) {
        try {
          introData = JSON.parse(studentRow.intro_json);
        } catch {}
      }
      student = {
        ...studentRow,
        one_line: introData.one_line || '',
        mbti: introData.mbti || '',
        hobby: introData.hobby || '',
      };
    }

    const walletRow = await queryOne<any>(
      `SELECT balance as coins, lifetime_earned as total_earned, lifetime_spent as total_spent 
       FROM wallets 
       WHERE user_id = $1`,
      [userId]
    ) || { coins: 0, total_earned: 0, total_spent: 0 };

    const bankRow = await queryOne<any>(
      `SELECT balance, 0 as total_interest, last_interest_date as last_interest_at 
       FROM bank_accounts 
       WHERE user_id = $1`,
      [userId]
    ) || { balance: 0, total_interest: 0, last_interest_at: null };

    const levelRow = await queryOne<any>(
      `SELECT level, xp as exp, xp as total_exp 
       FROM levels 
       WHERE user_id = $1`,
      [userId]
    ) || { level: 0, exp: 0, total_exp: 0 };

    const recordRow = await queryOne<any>(
      `SELECT merit_total as merit_points, demerit_total as penalty_points 
       FROM discipline_summary 
       WHERE user_id = $1`,
      [userId]
    ) || { merit_points: 0, penalty_points: 0 };

    const attendanceStats = await queryOne<any>(
      `SELECT COUNT(*)::INT as total_days, 
              COALESCE(MAX(streak), 0)::INT as max_streak,
              COALESCE((SELECT streak FROM attendance WHERE user_id = $1 ORDER BY date DESC LIMIT 1), 0)::INT as current_streak,
              (SELECT date FROM attendance WHERE user_id = $1 ORDER BY date DESC LIMIT 1) as last_attendance_date
       FROM attendance 
       WHERE user_id = $1`,
      [userId]
    ) || { total_days: 0, current_streak: 0, max_streak: 0, last_attendance_date: null };

    const recentAttendance = await query<any>(
      `SELECT date, streak as consecutive_days, points as reward_coins, bonus as reward_exp 
       FROM attendance 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT 31`,
      [userId]
    );

    const inventory = await query<any>(
      `SELECT i.item_id, i.count as quantity, i.acquired_at, s.name, s.description, s.category as item_type, s.price 
       FROM inventory i 
       JOIN shop_items s ON i.item_id = s.id 
       WHERE i.user_id = $1 
       ORDER BY i.acquired_at DESC`,
      [userId]
    );

    const disciplineLogs = await query<any>(
      `SELECT id, issued_by as teacher_id, points, kind as type, reason, created_at 
       FROM discipline 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

    const unlockedAchievements = await query<any>(
      `SELECT achievement_id, achieved_at as unlocked_at 
       FROM achievements_owned 
       WHERE user_id = $1 
       ORDER BY achieved_at DESC`,
      [userId]
    );

    return NextResponse.json({
      student,
      wallet: walletRow,
      bank: bankRow,
      level: levelRow,
      record: recordRow,
      attendanceStats,
      recentAttendance,
      inventory,
      disciplineLogs,
      unlockedAchievements,
    });
  } catch (error: any) {
    console.error('Student dashboard error:', error);
    return NextResponse.json({ error: `데이터를 불러오는 중 오류가 발생했습니다: ${error.message}` }, { status: 500 });
  }
}
