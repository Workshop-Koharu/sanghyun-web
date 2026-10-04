import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: '인증되지 않았습니다.' }, { status: 401 });
  }

  const userId = session.userId;
  const body = await req.json();
  const { one_line, mbti, hobby } = body;

  try {
    const student = await queryOne<any>('SELECT intro_json FROM students WHERE user_id = $1', [userId]);
    if (!student) {
      return NextResponse.json({ error: '학생 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    let introData: any = {};
    if (student.intro_json) {
      try {
        introData = JSON.parse(student.intro_json);
      } catch {}
    }

    introData.one_line = one_line || '';
    introData.mbti = mbti || '';
    introData.hobby = hobby || '';

    await query('UPDATE students SET intro_json = $1 WHERE user_id = $2', [JSON.stringify(introData), userId]);

    return NextResponse.json({ success: true, profile: introData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
