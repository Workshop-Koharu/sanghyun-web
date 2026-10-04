import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
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
      whereClause += ` AND (s.nickname ILIKE $${pIdx} OR s.student_code ILIKE $${pIdx})`;
      params.push(`%${search}%`);
      pIdx++;
    }
    if (grade) {
      whereClause += ` AND s.grade = $${pIdx}`;
      params.push(parseInt(grade, 10));
      pIdx++;
    }
    if (classNum) {
      whereClause += ` AND s.class_no = $${pIdx}`;
      params.push(parseInt(classNum, 10));
      pIdx++;
    }

    const students = await query<any>(
      `SELECT s.user_id,
              s.nickname as real_name,
              s.grade,
              s.class_no as class_num,
              s.student_no as student_num,
              s.student_code as student_id,
              s.status,
              s.created_at as enrolled_at,
              COALESCE(r.merit_total, 0) as merit_points, 
              COALESCE(r.demerit_total, 0) as penalty_points,
              COALESCE(w.balance, 0) as coins,
              COALESCE(l.level, 0) as level,
              c.club_name
       FROM students s
       LEFT JOIN discipline_summary r ON s.user_id = r.user_id
       LEFT JOIN wallets w ON s.user_id = w.user_id
       LEFT JOIN levels l ON s.user_id = l.user_id
       LEFT JOIN (
         SELECT cm.user_id, STRING_AGG(cl.name, ', ') as club_name
         FROM club_members cm
         JOIN clubs cl ON cm.club_id = cl.id
         GROUP BY cm.user_id
       ) c ON s.user_id = c.user_id
       ${whereClause}
       ORDER BY s.grade ASC, s.class_no ASC, s.student_no ASC`,
      params
    );

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error('Fetch students error:', error);
    return NextResponse.json({ error: '학생 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
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

    const kind = type === 'penalty' ? 'demerit' : 'merit';
    const nowSeconds = Math.floor(Date.now() / 1000);

    const inserted = await queryOne<any>(
      `INSERT INTO discipline (user_id, kind, points, reason, issued_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [BigInt(userId), kind, pts, reason, BigInt(session.userId), nowSeconds]
    );

    const summary = await queryOne<any>(
      `SELECT merit_total as merit_points, demerit_total as penalty_points 
       FROM discipline_summary 
       WHERE user_id = $1`,
      [BigInt(userId)]
    ) || { merit_points: 0, penalty_points: 0 };

    return NextResponse.json({ success: true, record: summary });
  } catch (error: any) {
    console.error('Discipline assign error:', error);
    return NextResponse.json({ error: `상벌점 부여 중 오류가 발생했습니다: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, nickname, grade, classNum, studentNum, studentCode, status } = body;

    if (!userId || !nickname) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    await query(
      `UPDATE students 
       SET nickname = $1, grade = $2, class_no = $3, student_no = $4, student_code = $5, status = $6 
       WHERE user_id = $7`,
      [
        nickname.trim(),
        parseInt(grade, 10) || 1,
        parseInt(classNum, 10) || 1,
        parseInt(studentNum, 10) || 1,
        studentCode.trim(),
        status || 'active',
        BigInt(userId),
      ]
    );

    await query(
      `INSERT INTO audit_logs (admin_id, admin_name, action, target_id, details, created_at)
       VALUES ($1, $2, '학적수정', $3, $4, $5)`,
      [
        BigInt(session.userId),
        session.username,
        BigInt(userId),
        `학생 정보 수정: ${nickname} (학번: ${studentCode}, 상태: ${status})`,
        nowSeconds,
      ]
    );

    return NextResponse.json({ success: true, message: '학생 정보가 성공적으로 수정되었습니다.' });
  } catch (error: any) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

