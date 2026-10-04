import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const userId = session.userId;

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
              c.id as club_id,
              c.name as club_name,
              c.description as club_desc,
              cm.role as club_role
       FROM students s 
       LEFT JOIN club_members cm ON s.user_id = cm.user_id
       LEFT JOIN clubs c ON cm.club_id = c.id AND c.status IN ('recruiting', 'active')
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

    let walletRow = { coins: 0, total_earned: 0, total_spent: 0 };
    try {
      const res = await queryOne<any>(
        `SELECT balance as coins, total_earned, total_spent 
         FROM wallets 
         WHERE user_id = $1`,
        [userId]
      );
      if (res) walletRow = res;
    } catch {}

    let bankRow = { balance: 0, total_interest: 0, last_interest_at: null };
    try {
      const res = await queryOne<any>(
        `SELECT deposit_balance as balance, 0 as total_interest, last_interest_date as last_interest_at 
         FROM bank_accounts 
         WHERE user_id = $1`,
        [userId]
      );
      if (res) bankRow = res;
    } catch {}

    let levelRow = { level: 1, exp: 0, total_exp: 0, message_count: 0, voice_seconds: 0 };
    try {
      const res = await queryOne<any>(
        `SELECT level, xp as exp, xp as total_exp, message_count, voice_seconds 
         FROM levels 
         WHERE user_id = $1`,
        [userId]
      );
      if (res) levelRow = res;
    } catch {}

    let recordRow = { merit_points: 0, penalty_points: 0 };
    try {
      const res = await queryOne<any>(
        `SELECT merit_total as merit_points, demerit_total as penalty_points 
         FROM discipline_summary 
         WHERE user_id = $1`,
        [userId]
      );
      if (res) recordRow = res;
    } catch {}

    let attendanceStats = { total_days: 0, current_streak: 0, max_streak: 0, last_attendance_date: null };
    try {
      const res = await queryOne<any>(
        `SELECT COUNT(*)::INT as total_days, 
                COALESCE(MAX(streak), 0)::INT as max_streak,
                COALESCE((SELECT streak FROM attendance WHERE user_id = $1 ORDER BY date DESC LIMIT 1), 0)::INT as current_streak,
                (SELECT date FROM attendance WHERE user_id = $1 ORDER BY date DESC LIMIT 1) as last_attendance_date
         FROM attendance 
         WHERE user_id = $1`,
        [userId]
      );
      if (res) attendanceStats = res;
    } catch {}

    let recentAttendance: any[] = [];
    try {
      recentAttendance = await query<any>(
        `SELECT date, streak as consecutive_days, points as reward_coins, bonus as reward_exp 
         FROM attendance 
         WHERE user_id = $1 
         ORDER BY date DESC 
         LIMIT 60`,
        [userId]
      );
    } catch {}

    let inventory: any[] = [];
    try {
      inventory = await query<any>(
        `SELECT i.item_id, i.quantity, i.acquired_at, s.name, s.description, s.item_type, s.price, s.payload_json 
         FROM inventory i 
         JOIN shop_items s ON i.item_id = s.id 
         WHERE i.user_id = $1 
         ORDER BY i.acquired_at DESC`,
        [userId]
      );
    } catch {}

    let disciplineLogs: any[] = [];
    try {
      disciplineLogs = await query<any>(
        `SELECT id, issued_by as teacher_id, points, kind as type, reason, created_at, revoked 
         FROM discipline 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 30`,
        [userId]
      );
    } catch {}

    let unlockedAchievements: any[] = [];
    try {
      unlockedAchievements = await query<any>(
        `SELECT achievement_id, achieved_at as unlocked_at 
         FROM achievements_owned 
         WHERE user_id = $1 
         ORDER BY achieved_at DESC`,
        [userId]
      );
    } catch {}

    let studentHistory: any[] = [];
    try {
      studentHistory = await query<any>(
        `SELECT id, event_type, from_value, to_value, created_at 
         FROM student_history 
         WHERE user_id = $1 
         ORDER BY created_at ASC`,
        [userId]
      );
    } catch {}

    let transactions: any[] = [];
    try {
      transactions = await query<any>(
        `SELECT id, type, amount, balance_after, counterparty_id, memo, created_at 
         FROM transactions 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 50`,
        [userId]
      );
    } catch {}

    let announcements: any[] = [];
    try {
      announcements = await query<any>(
        `SELECT id, title, content, author_name, pinned, created_at 
         FROM announcements 
         ORDER BY pinned DESC, created_at DESC 
         LIMIT 15`
      );
    } catch {}

    let clubMembers: any[] = [];
    if (studentRow?.club_id) {
      try {
        clubMembers = await query<any>(
          `SELECT cm.user_id, cm.role, s.nickname 
           FROM club_members cm 
           LEFT JOIN students s ON cm.user_id = s.user_id 
           WHERE cm.club_id = $1 
           ORDER BY cm.role DESC, cm.joined_at ASC`,
          [studentRow.club_id]
        );
      } catch {}
    }

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
      studentHistory,
      transactions,
      announcements,
      club: studentRow?.club_id
        ? {
            id: studentRow.club_id,
            name: studentRow.club_name,
            description: studentRow.club_desc,
            role: studentRow.club_role,
            members: clubMembers,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Student dashboard error:', error);
    return NextResponse.json({ error: `데이터를 불러오는 중 오류가 발생했습니다: ${error.message}` }, { status: 500 });
  }
}
