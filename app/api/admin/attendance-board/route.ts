import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const dateQuery = req.nextUrl.searchParams.get('date') || today;

    // All active students
    const allStudents = await query<any>(
      `SELECT s.user_id, s.nickname, s.student_code, s.grade, s.class_no, s.student_no,
              a.streak, a.points, a.created_at as attended_at
       FROM students s
       LEFT JOIN attendance a ON s.user_id = a.user_id AND a.date = $1
       WHERE s.status = 'active'
       ORDER BY s.grade ASC, s.class_no ASC, s.student_no ASC`,
      [dateQuery]
    );

    const attended = allStudents.filter((s) => s.attended_at !== null);
    const unattended = allStudents.filter((s) => s.attended_at === null);

    // Monthly low attendance rate (< 50%)
    // Let's count days in current month so far:
    const daysSoFar = Math.max(new Date().getDate(), 1);
    const lowAttendanceStudents = await query<any>(
      `SELECT s.user_id, s.nickname, s.student_code, s.grade, s.class_no, COUNT(a.id)::INT as attended_days
       FROM students s
       LEFT JOIN attendance a ON s.user_id = a.user_id AND a.date LIKE $1
       WHERE s.status = 'active'
       GROUP BY s.user_id, s.nickname, s.student_code, s.grade, s.class_no
       HAVING (COUNT(a.id)::FLOAT / $2) < 0.5
       ORDER BY attended_days ASC`,
      [`${dateQuery.slice(0, 7)}%`, daysSoFar]
    );

    return NextResponse.json({
      date: dateQuery,
      totalCount: allStudents.length,
      attendedCount: attended.length,
      unattendedCount: unattended.length,
      attended,
      unattended,
      lowAttendanceStudents,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
