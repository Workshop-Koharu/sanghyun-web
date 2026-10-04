import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const rows = await query<{ key: string; value: string }>(
      `SELECT key, value FROM settings`
    );

    const settingsObj: Record<string, string> = {};
    for (const r of rows) {
      settingsObj[r.key] = r.value;
    }

    return NextResponse.json({ settings: settingsObj });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: `설정을 불러오지 못했습니다: ${error.message}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: '올바른 설정 데이터가 아닙니다.' }, { status: 400 });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    for (const [key, value] of Object.entries(settings)) {
      const valStr = String(value ?? '');
      await query(
        `INSERT INTO settings (key, value, updated_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (key) 
         DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
        [key, valStr, nowSeconds]
      );

      if (key === 'channel_admission') {
        await query(
          `INSERT INTO settings (key, value, updated_at) VALUES ('channel.admission_notice', $1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
          [valStr, nowSeconds]
        );
      } else if (key === 'channel_attendance') {
        await query(
          `INSERT INTO settings (key, value, updated_at) VALUES ('channel.attendance', $1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
          [valStr, nowSeconds]
        );
      } else if (key === 'channel_discipline') {
        await query(
          `INSERT INTO settings (key, value, updated_at) VALUES ('channel.discipline', $1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
          [valStr, nowSeconds]
        );
      } else if (key === 'max_classes') {
        await query(
          `INSERT INTO settings (key, value, updated_at) VALUES ('class.count', $1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
          [valStr, nowSeconds]
        );
      } else if (key === 'attendance_coins') {
        await query(
          `INSERT INTO settings (key, value, updated_at) VALUES ('attendance.point_min', $1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
          [valStr, nowSeconds]
        );
      }
    }

    return NextResponse.json({ success: true, message: '설정이 성공적으로 저장되었습니다.' });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: `설정 저장 중 오류가 발생했습니다: ${error.message}` }, { status: 500 });
  }
}
