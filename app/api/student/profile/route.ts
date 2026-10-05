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
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const { one_line, mbti, hobby } = body;

  // Sanitize and enforce strict length bounds
  const cleanOneLine = typeof one_line === 'string' ? one_line.trim().slice(0, 100) : '';
  const cleanMbti = typeof mbti === 'string' ? mbti.trim().toUpperCase().slice(0, 4) : '';
  const cleanHobby = typeof hobby === 'string' ? hobby.trim().slice(0, 50) : '';

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

    introData.one_line = cleanOneLine;
    introData.mbti = cleanMbti;
    introData.hobby = cleanHobby;

    await query('UPDATE students SET intro_json = $1 WHERE user_id = $2', [JSON.stringify(introData), userId]);

    return NextResponse.json({ success: true, profile: introData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
