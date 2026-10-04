import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const questions = await query<any>(
      `SELECT id, date, question_text as question, author_id, public_message_id, written_at, created_at 
       FROM daily_questions 
       ORDER BY date DESC 
       LIMIT 50`
    );
    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Fetch questions error:', error);
    return NextResponse.json({ error: '질문 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { date, question } = body;

    if (!date || !question) {
      return NextResponse.json({ error: '날짜(YYYY-MM-DD)와 질문 내용은 필수입니다.' }, { status: 400 });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    const saved = await queryOne<any>(
      `INSERT INTO daily_questions (date, question_text, author_id, written_at, created_at)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (date)
       DO UPDATE SET 
         question_text = EXCLUDED.question_text, 
         author_id = EXCLUDED.author_id,
         written_at = EXCLUDED.written_at
       RETURNING id, date, question_text as question, author_id, public_message_id, written_at, created_at`,
      [date, question, BigInt(session.userId), nowSeconds]
    );

    return NextResponse.json({ success: true, question: saved });
  } catch (error: any) {
    console.error('Save question error:', error);
    return NextResponse.json({ error: `질문 등록에 실패했습니다: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const date = req.nextUrl.searchParams.get('date');
  if (!date) {
    return NextResponse.json({ error: '날짜가 필요합니다.' }, { status: 400 });
  }

  try {
    await query(`DELETE FROM daily_questions WHERE date = $1`, [date]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: '질문 삭제에 실패했습니다.' }, { status: 500 });
  }
}
