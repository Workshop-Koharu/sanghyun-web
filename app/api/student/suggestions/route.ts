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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 본문 형식입니다.' }, { status: 400 });
  }

  try {
    const userId = BigInt(session.userId);
    const now = Math.floor(Date.now() / 1000);

    // 1. Voting on suggestion
    if (body.action === 'vote') {
      const suggestionId = parseInt(String(body.suggestionId), 10);
      if (isNaN(suggestionId) || suggestionId <= 0) {
        return NextResponse.json({ error: '유효한 건의 ID가 아닙니다.' }, { status: 400 });
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
      const suggestionId = parseInt(String(body.suggestionId), 10);
      if (isNaN(suggestionId) || suggestionId <= 0) {
        return NextResponse.json({ error: '유효한 건의 ID가 아닙니다.' }, { status: 400 });
      }

      const allowedStatuses = ['open', 'in_progress', 'resolved', 'rejected'];
      const status = typeof body.status === 'string' && allowedStatuses.includes(body.status) ? body.status : 'open';
      const adminResponse = typeof body.admin_response === 'string' ? body.admin_response.trim().slice(0, 1000) : '';

      await query(
        'UPDATE student_suggestions SET status = $1, admin_response = $2 WHERE id = $3',
        [status, adminResponse, suggestionId]
      );
      return NextResponse.json({ success: true, message: '건의 상태가 업데이트되었습니다.' });
    }

    // 3. New Suggestion submission
    const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
    const rawContent = typeof body.content === 'string' ? body.content.trim() : '';

    if (!rawTitle || rawTitle.length < 2) {
      return NextResponse.json({ error: '제목은 최소 2자 이상 입력해주세요.' }, { status: 400 });
    }
    if (rawTitle.length > 100) {
      return NextResponse.json({ error: '제목은 최대 100자까지 가능합니다.' }, { status: 400 });
    }
    if (!rawContent || rawContent.length < 5) {
      return NextResponse.json({ error: '내용은 최소 5자 이상 입력해주세요.' }, { status: 400 });
    }
    if (rawContent.length > 2000) {
      return NextResponse.json({ error: '내용은 최대 2,000자까지 입력 가능합니다.' }, { status: 400 });
    }

    // Lookup student nickname
    const student = await queryOne<any>('SELECT nickname FROM students WHERE user_id = $1', [userId]);
    const authorName = (student?.nickname || session.username || '학생').slice(0, 32);

    const inserted = await queryOne<any>(
      `INSERT INTO student_suggestions (user_id, author_name, title, content, upvotes, status, created_at)
       VALUES ($1, $2, $3, $4, 1, 'open', $5)
       RETURNING id`,
      [userId, authorName, rawTitle, rawContent, now]
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
