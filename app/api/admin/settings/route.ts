import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS: Record<string, string> = {
  'channel.admission_notice': '',
  'channel.log': '',
  'channel.birthday': '',
  'channel.achievement': '',
  'channel.daily_question_public': '',
  'channel.daily_question_admin': '',
  'channel.club_recruit': '',
  'role.student': '',
  'role.teacher': '',
  'role.council': '',
  'role.graduate': '',
  'role.birthday': '',
  'attendance.point_min': '50',
  'attendance.point_max': '150',
  'bank.daily_rate_bps': '20',
  'bank.deposit_limit': '5000000',
  'economy.transfer_fee_percent': '5',
  'part_time.cooldown_minutes': '30',
  'class.count': '5',
  'grade.promotion_months': '4',
  'grade.max_grade': '3',
  'question.hour': '9',
  'question.minute': '0',
  'achievement.notify': 'true',
};

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const rows = await query<{ key: string; value: string }>(
      `SELECT key, value FROM settings`
    );

    const settingsObj: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of rows) {
      settingsObj[r.key] = r.value;
      if (r.key === 'channel.admission_notice') settingsObj['channel_admission'] = r.value;
      if (r.key === 'class.count') settingsObj['max_classes'] = r.value;
      if (r.key === 'attendance.point_min') settingsObj['attendance_coins'] = r.value;
      if (r.key === 'bank.daily_rate_bps') {
        const num = parseFloat(r.value);
        if (!isNaN(num)) settingsObj['bank_interest_rate'] = (num / 10).toFixed(1);
      }
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
      const valStr = String(value ?? '').trim();
      await query(
        `INSERT INTO settings (key, value, updated_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (key) 
         DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
        [key, valStr, nowSeconds]
      );

      if (key === 'channel_admission' || key === 'channel.admission_notice') {
        await query(
          `INSERT INTO settings (key, value, updated_at) VALUES ('channel.admission_notice', $1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
          [valStr, nowSeconds]
        );
      } else if (key === 'max_classes' || key === 'class.count') {
        await query(
          `INSERT INTO settings (key, value, updated_at) VALUES ('class.count', $1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
          [valStr, nowSeconds]
        );
      } else if (key === 'attendance_coins' || key === 'attendance.point_min') {
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
