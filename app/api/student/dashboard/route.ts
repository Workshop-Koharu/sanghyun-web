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
              s.intro_json
       FROM students s 
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
        avatar_url: introData.avatar_url || null,
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

    let userClubs: any[] = [];
    try {
      userClubs = await query<any>(
        `SELECT c.id, c.name, c.description, cm.role, c.status
         FROM club_members cm
         JOIN clubs c ON cm.club_id = c.id
         WHERE cm.user_id = $1 AND c.status IN ('recruiting', 'active')
         ORDER BY (cm.role = 'leader') DESC, (cm.role = 'vice_leader') DESC, cm.joined_at ASC
         LIMIT 5`,
        [userId]
      );
    } catch {}

    const clubsWithMembers = await Promise.all(
      userClubs.map(async (cl: any) => {
        let members: any[] = [];
        try {
          members = await query<any>(
            `SELECT cm.user_id, cm.role, s.nickname 
             FROM club_members cm 
             LEFT JOIN students s ON cm.user_id = s.user_id 
             WHERE cm.club_id = $1 
             ORDER BY cm.role DESC, cm.joined_at ASC`,
            [cl.id]
          );
        } catch {}
        return {
          id: cl.id,
          name: cl.name,
          description: cl.description,
          role: cl.role,
          status: cl.status,
          members,
        };
      })
    );

    if (student) {
      student.club_name = userClubs.map((c: any) => c.name).join(', ') || null;
    }

    // 273. 오늘의 질문 (Today's Question)
    let todayQuestion: any = null;
    try {
      const todayKST = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
      todayQuestion = await queryOne<any>(
        `SELECT date, question_text as question, author_id, public_message_id, created_at 
         FROM daily_questions 
         WHERE date = $1`,
        [todayKST]
      );
      if (!todayQuestion) {
        todayQuestion = await queryOne<any>(
          `SELECT date, question_text as question, author_id, public_message_id, created_at 
           FROM daily_questions 
           ORDER BY date DESC 
           LIMIT 1`
        );
      }
    } catch {}

    // 274. 전교생 랭킹 (Leaderboards)
    let leaderboard = { topExp: [], topCoins: [], topStreak: [] };
    try {
      const topExp = await query<any>(
        `SELECT s.user_id, s.real_name, s.student_id, l.level, l.total_exp 
         FROM levels l 
         JOIN students s ON l.user_id = s.user_id 
         WHERE s.status = 'active'
         ORDER BY l.total_exp DESC, l.level DESC 
         LIMIT 5`
      );
      const topCoins = await query<any>(
        `SELECT s.user_id, s.real_name, s.student_id, (COALESCE(w.balance, 0) + COALESCE(b.deposit_balance, 0)) as total_coins 
         FROM students s
         LEFT JOIN wallets w ON s.user_id = w.user_id 
         LEFT JOIN bank_accounts b ON s.user_id = b.user_id 
         WHERE s.status = 'active'
         ORDER BY total_coins DESC 
         LIMIT 5`
      );
      const topStreak = await query<any>(
        `SELECT s.user_id, s.real_name, s.student_id, MAX(a.streak) as max_streak 
         FROM attendance a 
         JOIN students s ON a.user_id = s.user_id 
         WHERE s.status = 'active'
         GROUP BY s.user_id, s.real_name, s.student_id 
         ORDER BY max_streak DESC 
         LIMIT 5`
      );
      leaderboard = { topExp: topExp as any, topCoins: topCoins as any, topStreak: topStreak as any };
    } catch {}

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
      todayQuestion,
      leaderboard,
      clubs: clubsWithMembers,
      club: clubsWithMembers[0] || null,
    });
  } catch (error: any) {
    console.error('Student dashboard error:', error);
    return NextResponse.json({ error: `데이터를 불러오는 중 오류가 발생했습니다: ${error.message}` }, { status: 500 });
  }
}
