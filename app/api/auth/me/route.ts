import { NextRequest, NextResponse } from 'next/server';
import { getSession, getDefaultDiscordAvatar } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json(
      { authenticated: false, user: null },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  }

  const userAvatar = session.avatar || getDefaultDiscordAvatar(session.userId);
  return NextResponse.json(
    {
      authenticated: true,
      user: {
        ...session,
        avatar: userAvatar,
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}
