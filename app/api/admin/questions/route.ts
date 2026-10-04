import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET() {
  try {
    const questions = await query<any>(
      `SELECT * FROM daily_questions ORDER BY date DESC LIMIT 50`
    );
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Fetch questions error:', error);
    return NextResponse.json({ error: '질문 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { date, question } = body;

    if (!date || !question) {
      return NextResponse.json({ error: '날짜(YYYY-MM-DD)와 질문 내용은 필수입니다.' }, { status: 400 });
    }

    const saved = await queryOne<any>(
      `INSERT INTO daily_questions (date, question, author_id, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (date)
       DO UPDATE SET question = $2, author_id = $3, created_at = NOW()
       RETURNING *`,
      [date, question, session.userId]
    );

    return NextResponse.json({ success: true, question: saved });
  } catch (error) {
    console.error('Save question error:', error);
    return NextResponse.json({ error: '질문 등록에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
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
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: '질문 삭제에 실패했습니다.' }, { status: 500 });
  }
}
