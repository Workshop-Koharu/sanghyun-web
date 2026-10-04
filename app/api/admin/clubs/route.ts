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
    const clubs = await query<any>(
      `SELECT c.id, c.name, c.description, c.leader_id, c.status, c.created_at,
              s.nickname as leader_name,
              COUNT(cm.user_id)::INT as member_count
       FROM clubs c
       LEFT JOIN students s ON c.leader_id = s.user_id
       LEFT JOIN club_members cm ON c.id = cm.club_id
       GROUP BY c.id, c.name, c.description, c.leader_id, c.status, c.created_at, s.nickname
       ORDER BY c.created_at DESC`
    );

    return NextResponse.json({ clubs });
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
    const { clubId, action } = body;

    if (!clubId || !action) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    let newStatus = 'active';
    if (action === 'approve') newStatus = 'active';
    else if (action === 'reject') newStatus = 'failed';
    else if (action === 'disband') newStatus = 'disbanded';

    await query('UPDATE clubs SET status = $1 WHERE id = $2', [newStatus, clubId]);

    const now = Math.floor(Date.now() / 1000);
    await query(
      `INSERT INTO audit_logs (admin_id, admin_name, action, details, created_at)
       VALUES ($1, $2, '동아리관리', $3, $4)`,
      [BigInt(session.userId), session.username, `동아리 ID ${clubId} 상태 변경: ${newStatus}`, now]
    );

    return NextResponse.json({ success: true, message: `동아리 상태가 '${newStatus}'(으)로 변경되었습니다.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
