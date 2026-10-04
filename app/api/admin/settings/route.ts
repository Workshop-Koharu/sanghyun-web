import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

const GUILD_ID = process.env.NEXT_PUBLIC_GUILD_ID || '1528353970714841110';

export async function GET() {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const rows = await query<{ key: string; value: string }>(
      `SELECT key, value FROM bot_settings WHERE guild_id = $1`,
      [GUILD_ID]
    );

    const settingsObj: Record<string, string> = {};
    for (const r of rows) {
      settingsObj[r.key] = r.value;
    }

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: '설정을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: '올바른 설정 데이터가 아닙니다.' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO bot_settings (guild_id, key, value, updated_at) 
         VALUES ($1, $2, $3, NOW()) 
         ON CONFLICT (guild_id, key) 
         DO UPDATE SET value = $3, updated_at = NOW()`,
        [GUILD_ID, key, String(value)]
      );
    }

    return NextResponse.json({ success: true, message: '설정이 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: '설정 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
