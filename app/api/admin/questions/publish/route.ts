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
    const body = await req.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({ error: '날짜(YYYY-MM-DD)를 입력해 주세요.' }, { status: 400 });
    }

    const q = await queryOne<any>(
      `SELECT * FROM daily_questions WHERE date = $1`,
      [date]
    );

    if (!q || !q.question_text) {
      return NextResponse.json({ error: '해당 날짜에 등록된 질문 내용이 없습니다.' }, { status: 404 });
    }

    const channelSetting = await queryOne<any>(
      `SELECT value FROM settings WHERE key = 'channel.daily_question_public'`,
      []
    );

    const publicChannelId = channelSetting?.value;
    if (!publicChannelId || publicChannelId === '0') {
      return NextResponse.json(
        { error: '공개 질문 채널이 설정되지 않았습니다. 디스코드에서 `/오늘의질문 채널설정`으로 먼저 설정해 주세요.' },
        { status: 400 }
      );
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: '디스코드 봇 토큰(DISCORD_BOT_TOKEN)이 웹 서버에 설정되어 있지 않습니다.' },
        { status: 500 }
      );
    }

    const messageContent = `## 오늘의 질문 · ${q.date}\n### ${q.question_text}\n-# 학생 여러분의 다양한 생각과 답변을 스레드 또는 댓글로 남겨보세요!`;

    const discordRes = await fetch(
      `https://discord.com/api/v10/channels/${publicChannelId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          allowed_mentions: { parse: [] },
        }),
      }
    );

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      return NextResponse.json(
        { error: `디스코드 채널 전송 실패 (${discordRes.status}): ${errText}` },
        { status: 500 }
      );
    }

    const msgData = await discordRes.json();
    await query(
      `UPDATE daily_questions SET public_message_id = $1 WHERE date = $2`,
      [BigInt(msgData.id), date]
    );

    return NextResponse.json({ success: true, messageId: msgData.id });
  } catch (error: any) {
    console.error('Publish question error:', error);
    return NextResponse.json({ error: `질문 전송 중 오류 발생: ${error.message}` }, { status: 500 });
  }
}
