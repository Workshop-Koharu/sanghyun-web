import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID || '1555170310498549840';
  const appUrl = getBaseUrl(req);
  const redirectUri = `${appUrl}/api/auth/callback`;

  const scope = encodeURIComponent('identify guilds');
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&prompt=consent`;

  return NextResponse.redirect(discordAuthUrl);
}
