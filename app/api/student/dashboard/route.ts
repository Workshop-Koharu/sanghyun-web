import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const userId = session.userId;

  try {
    const student = await queryOne<any>(
      `SELECT s.*, c.name as club_name 
       FROM students s 
       LEFT JOIN clubs c ON s.club_id = c.id 
       WHERE s.user_id = $1`,
      [userId]
    );

    const wallet = await queryOne<any>(
      `SELECT coins, total_earned, total_spent FROM wallets WHERE user_id = $1`,
      [userId]
    ) || { coins: 0, total_earned: 0, total_spent: 0 };

    const bank = await queryOne<any>(
      `SELECT balance, total_interest, last_interest_at FROM bank_accounts WHERE user_id = $1`,
      [userId]
    ) || { balance: 0, total_interest: 0, last_interest_at: null };

    const level = await queryOne<any>(
      `SELECT level, exp, total_exp FROM levels WHERE user_id = $1`,
      [userId]
    ) || { level: 1, exp: 0, total_exp: 0 };

    const record = await queryOne<any>(
      `SELECT merit_points, penalty_points FROM student_records WHERE user_id = $1`,
      [userId]
    ) || { merit_points: 0, penalty_points: 0 };

    const attendanceStats = await queryOne<any>(
      `SELECT total_days, current_streak, max_streak, last_attendance_date FROM attendance_stats WHERE user_id = $1`,
      [userId]
    ) || { total_days: 0, current_streak: 0, max_streak: 0, last_attendance_date: null };

    const recentAttendance = await query<any>(
      `SELECT date, consecutive_days, reward_coins, reward_exp 
       FROM attendance 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT 31`,
      [userId]
    );

    const inventory = await query<any>(
      `SELECT i.item_id, i.quantity, i.acquired_at, s.name, s.description, s.item_type, s.price 
       FROM inventories i 
       JOIN shop_items s ON i.item_id = s.id 
       WHERE i.user_id = $1 
       ORDER BY i.acquired_at DESC`,
      [userId]
    );

    const disciplineLogs = await query<any>(
      `SELECT id, teacher_id, points, type, reason, created_at 
       FROM discipline_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

    const unlockedAchievements = await query<any>(
      `SELECT achievement_id, unlocked_at 
       FROM achievements 
       WHERE user_id = $1 
       ORDER BY unlocked_at DESC`,
      [userId]
    );

    return NextResponse.json({
      student,
      wallet,
      bank,
      level,
      record,
      attendanceStats,
      recentAttendance,
      inventory,
      disciplineLogs,
      unlockedAchievements,
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
