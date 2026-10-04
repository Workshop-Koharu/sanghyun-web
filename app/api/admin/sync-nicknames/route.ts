import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const row = await queryOne<any>(
      `INSERT INTO web_actions (action, payload, requested_by, status, created_at)
       VALUES ('sync_nicknames', '{}', $1, 'pending', $2)
       RETURNING id`,
      [BigInt(session.userId), now]
    );

    // Also write an audit log
    await query(
      `INSERT INTO audit_logs (admin_id, admin_name, action, details, created_at)
       VALUES ($1, $2, '닉네임동기화', '전교생 닉네임 일괄 동기화 요청', $3)`,
      [BigInt(session.userId), session.username, now]
    );

    return NextResponse.json({
      success: true,
      message: '전교생 닉네임 일괄 동기화 요청이 봇에 등록되었습니다.',
      actionId: row?.id,
    });
  } catch (error: any) {
    console.error('Sync nicknames error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
