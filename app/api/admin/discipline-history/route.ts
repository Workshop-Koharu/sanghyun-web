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
    const logs = await query<any>(
      `SELECT d.id, d.user_id, d.kind, d.points, d.reason, d.issued_by, d.created_at, d.revoked, d.revoked_reason,
              s.nickname as student_name, s.student_code
       FROM discipline d
       LEFT JOIN students s ON d.user_id = s.user_id
       ORDER BY d.created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, reason } = body;

    if (!id) {
      return NextResponse.json({ error: '상벌점 ID가 누락되었습니다.' }, { status: 400 });
    }

    const revokeReason = reason || '관리자 직권 취소';
    await query(
      `UPDATE discipline
       SET revoked = 1, revoked_reason = $1, revoked_by = $2
       WHERE id = $3`,
      [revokeReason, BigInt(session.userId), id]
    );

    const now = Math.floor(Date.now() / 1000);
    await query(
      `INSERT INTO audit_logs (admin_id, admin_name, action, details, created_at)
       VALUES ($1, $2, '상벌점취소', $3, $4)`,
      [BigInt(session.userId), session.username, `상벌점 기록 #${id} 취소 (사유: ${revokeReason})`, now]
    );

    return NextResponse.json({ success: true, message: `상벌점 기록 #${id}이(가) 성공적으로 취소되었습니다.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
