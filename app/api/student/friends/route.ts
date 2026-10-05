import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.userId) {
      return NextResponse.json({ error: '디스코드 로그인이 필요합니다.' }, { status: 401 });
    }

    const userId = BigInt(session.userId);

    // 1. Accepted Friends List
    const friends = await query<any>(
      `SELECT 
          CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END as friend_user_id,
          f.created_at as friendship_date,
          s.real_name,
          s.grade,
          s.class_num,
          s.student_num,
          s.club_name,
          s.mbti,
          s.one_line,
          COALESCE(l.level, 1) as level
       FROM friends f
       JOIN students s ON s.user_id = (CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END)
       LEFT JOIN student_levels l ON l.user_id = s.user_id
       WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
       ORDER BY s.grade ASC, s.class_num ASC, s.student_num ASC`,
      [userId]
    );

    // 2. Pending Requests Received by me
    const pendingReceived = await query<any>(
      `SELECT 
          f.user_id as requester_user_id,
          f.created_at as requested_at,
          s.real_name,
          s.grade,
          s.class_num,
          s.student_num,
          s.club_name,
          COALESCE(l.level, 1) as level
       FROM friends f
       JOIN students s ON s.user_id = f.user_id
       LEFT JOIN student_levels l ON l.user_id = s.user_id
       WHERE f.friend_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    // 3. Pending Requests Sent by me
    const pendingSent = await query<any>(
      `SELECT 
          f.friend_id as target_user_id,
          f.created_at as requested_at,
          s.real_name,
          s.grade,
          s.class_num,
          s.student_num
       FROM friends f
       JOIN students s ON s.user_id = f.friend_id
       WHERE f.user_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    // 4. Student Directory / Recommendations (excluding self and existing friends)
    const suggestions = await query<any>(
      `SELECT 
          s.user_id,
          s.real_name,
          s.grade,
          s.class_num,
          s.student_num,
          s.club_name,
          COALESCE(l.level, 1) as level
       FROM students s
       LEFT JOIN student_levels l ON l.user_id = s.user_id
       WHERE s.user_id != $1 AND s.status = 'active'
         AND s.user_id NOT IN (
           SELECT CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
           FROM friends f
           WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status IN ('accepted', 'pending')
         )
       ORDER BY s.grade ASC, s.class_num ASC, s.student_num ASC
       LIMIT 30`,
      [userId]
    );

    return NextResponse.json({
      friends: friends.map((f) => ({ ...f, friend_user_id: f.friend_user_id.toString() })),
      pendingReceived: pendingReceived.map((p) => ({ ...p, requester_user_id: p.requester_user_id.toString() })),
      pendingSent: pendingSent.map((p) => ({ ...p, target_user_id: p.target_user_id.toString() })),
      suggestions: suggestions.map((s) => ({ ...s, user_id: s.user_id.toString() })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.userId) {
    return NextResponse.json({ error: '디스코드 로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 본문입니다.' }, { status: 400 });
  }

  try {
    const userId = BigInt(session.userId);
    const action = body.action;
    const targetUserIdStr = body.targetUserId;

    if (!targetUserIdStr) {
      return NextResponse.json({ error: '대상 학우 ID가 누락되었습니다.' }, { status: 400 });
    }

    const targetUserId = BigInt(targetUserIdStr);
    if (userId === targetUserId) {
      return NextResponse.json({ error: '자기 자신에게는 친구 요청을 보낼 수 없습니다.' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);

    // 1. Send Friend Request
    if (action === 'request') {
      const existing = await queryOne<any>(
        `SELECT status FROM friends
         WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [userId, targetUserId]
      );

      if (existing) {
        if (existing.status === 'accepted') {
          return NextResponse.json({ error: '이미 친구 관계인 학우입니다.' }, { status: 400 });
        }
        if (existing.status === 'pending') {
          return NextResponse.json({ error: '이미 친구 요청이 진행 중입니다.' }, { status: 400 });
        }
        // Re-request if rejected
        await query(
          `UPDATE friends
           SET user_id = $1, friend_id = $2, status = 'pending', updated_at = $3
           WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
          [userId, targetUserId, now]
        );
      } else {
        await query(
          `INSERT INTO friends (user_id, friend_id, status, created_at, updated_at)
           VALUES ($1, $2, 'pending', $3, $3)`,
          [userId, targetUserId, now]
        );
      }

      return NextResponse.json({ success: true, message: '친구 요청을 전송했습니다.' });
    }

    // 2. Accept Friend Request
    if (action === 'accept') {
      await query(
        `UPDATE friends
         SET status = 'accepted', updated_at = $1
         WHERE user_id = $2 AND friend_id = $3 AND status = 'pending'`,
        [now, targetUserId, userId]
      );

      return NextResponse.json({ success: true, message: '친구 요청을 수락했습니다!' });
    }

    // 3. Reject Friend Request
    if (action === 'reject') {
      await query(
        `UPDATE friends
         SET status = 'rejected', updated_at = $1
         WHERE user_id = $2 AND friend_id = $3 AND status = 'pending'`,
        [now, targetUserId, userId]
      );

      return NextResponse.json({ success: true, message: '친구 요청을 거절했습니다.' });
    }

    // 4. Remove Friend
    if (action === 'remove') {
      await query(
        `DELETE FROM friends
         WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [userId, targetUserId]
      );

      return NextResponse.json({ success: true, message: '친구 관계를 해제했습니다.' });
    }

    return NextResponse.json({ error: '알 수 없는 요청 액션입니다.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
