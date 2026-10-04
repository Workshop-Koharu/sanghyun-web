import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const search = req.nextUrl.searchParams.get('q') || '';
  const grade = req.nextUrl.searchParams.get('grade');
  const classNum = req.nextUrl.searchParams.get('class');

  try {
    let whereClause = `WHERE 1=1`;
    const params: any[] = [];
    let pIdx = 1;

    if (search) {
      whereClause += ` AND (s.real_name ILIKE $${pIdx} OR s.student_id ILIKE $${pIdx})`;
      params.push(`%${search}%`);
      pIdx++;
    }
    if (grade) {
      whereClause += ` AND s.grade = $${pIdx}`;
      params.push(parseInt(grade, 10));
      pIdx++;
    }
    if (classNum) {
      whereClause += ` AND s.class_num = $${pIdx}`;
      params.push(parseInt(classNum, 10));
      pIdx++;
    }

    const students = await query<any>(
      `SELECT s.*, 
              COALESCE(r.merit_points, 0) as merit_points, 
              COALESCE(r.penalty_points, 0) as penalty_points,
              COALESCE(w.coins, 0) as coins,
              COALESCE(l.level, 1) as level,
              c.name as club_name
       FROM students s
       LEFT JOIN student_records r ON s.user_id = r.user_id
       LEFT JOIN wallets w ON s.user_id = w.user_id
       LEFT JOIN levels l ON s.user_id = l.user_id
       LEFT JOIN clubs c ON s.club_id = c.id
       ${whereClause}
       ORDER BY s.grade ASC, s.class_num ASC, s.student_num ASC
       LIMIT 100`,
      params
    );

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Fetch students error:', error);
    return NextResponse.json({ error: '학생 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, type, points, reason } = body;

    if (!userId || !type || !points || !reason) {
      return NextResponse.json({ error: '모든 필수 항목을 입력해 주세요.' }, { status: 400 });
    }

    const pts = parseInt(points, 10);
    if (isNaN(pts) || pts <= 0) {
      return NextResponse.json({ error: '점수는 1 이상의 정수여야 합니다.' }, { status: 400 });
    }

    if (type !== 'merit' && type !== 'penalty') {
      return NextResponse.json({ error: '올바른 상벌점 종류가 아닙니다.' }, { status: 400 });
    }

    await query(
      `INSERT INTO discipline_logs (user_id, teacher_id, points, type, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, session.userId, pts, type, reason]
    );

    const record = await queryOne<any>(
      `INSERT INTO student_records (user_id, merit_points, penalty_points, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET 
         merit_points = student_records.merit_points + $2,
         penalty_points = student_records.penalty_points + $3,
         updated_at = NOW()
       RETURNING *`,
      [userId, type === 'merit' ? pts : 0, type === 'penalty' ? pts : 0]
    );

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Discipline assign error:', error);
    return NextResponse.json({ error: '상벌점 부여 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
