import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    const userId = session?.userId ? BigInt(session.userId) : null;

    const suggestions = await query<any>(
      `SELECT s.id, s.user_id, s.author_name, s.title, s.content, s.upvotes, s.status, s.admin_response, s.created_at,
              COALESCE(st.grade, 1) as grade, COALESCE(st.class_no, 1) as class_no,
              CASE WHEN sv.user_id IS NOT NULL THEN true ELSE false END as has_voted
       FROM student_suggestions s
       LEFT JOIN students st ON s.user_id = st.user_id
       LEFT JOIN suggestion_votes sv ON s.id = sv.suggestion_id AND sv.user_id = $1
       ORDER BY s.id DESC
       LIMIT 50`,
      [userId || 0]
    );

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = BigInt(session.userId);
    const now = Math.floor(Date.now() / 1000);

    // 1. Voting on suggestion
    if (body.action === 'vote') {
      const { suggestionId } = body;
      if (!suggestionId) {
        return NextResponse.json({ error: '건의 ID가 누락되었습니다.' }, { status: 400 });
      }

      const existingVote = await queryOne<any>(
        'SELECT 1 FROM suggestion_votes WHERE suggestion_id = $1 AND user_id = $2',
        [suggestionId, userId]
      );

      if (existingVote) {
        // Cancel vote
        await query('DELETE FROM suggestion_votes WHERE suggestion_id = $1 AND user_id = $2', [suggestionId, userId]);
        await query('UPDATE student_suggestions SET upvotes = GREATEST(0, upvotes - 1) WHERE id = $1', [suggestionId]);
        return NextResponse.json({ success: true, voted: false });
      } else {
        // Add vote
        await query('INSERT INTO suggestion_votes (suggestion_id, user_id, created_at) VALUES ($1, $2, $3)', [
          suggestionId,
          userId,
          now,
        ]);
        await query('UPDATE student_suggestions SET upvotes = upvotes + 1 WHERE id = $1', [suggestionId]);
        return NextResponse.json({ success: true, voted: true });
      }
    }

    // 2. Admin changing status / replying
    if (body.action === 'status') {
      if (!session.isAdmin) {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
      }
      const { suggestionId, status, admin_response } = body;
      await query(
        'UPDATE student_suggestions SET status = $1, admin_response = $2 WHERE id = $3',
        [status, admin_response || '', suggestionId]
      );
      return NextResponse.json({ success: true, message: '건의 상태가 업데이트되었습니다.' });
    }

    // 3. New Suggestion submission
    const { title, content } = body;
    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용을 모두 입력해 주세요.' }, { status: 400 });
    }

    // Lookup student nickname
    const student = await queryOne<any>('SELECT nickname FROM students WHERE user_id = $1', [userId]);
    const authorName = student?.nickname || session.username;

    const inserted = await queryOne<any>(
      `INSERT INTO student_suggestions (user_id, author_name, title, content, upvotes, status, created_at)
       VALUES ($1, $2, $3, $4, 1, 'open', $5)
       RETURNING id`,
      [userId, authorName, title.trim(), content.trim(), now]
    );

    // Auto-vote by author
    if (inserted?.id) {
      await query(
        'INSERT INTO suggestion_votes (suggestion_id, user_id, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [inserted.id, userId, now]
      );
    }

    return NextResponse.json({
      success: true,
      message: '건의사항이 학생회에 성공적으로 접수되었습니다.',
      suggestionId: inserted?.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
