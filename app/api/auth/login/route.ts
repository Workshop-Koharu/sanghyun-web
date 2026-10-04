import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID || '1555170310498549840';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const redirectUri = `${appUrl}/api/auth/callback`;

  const scope = encodeURIComponent('identify guilds');
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&prompt=consent`;

  return NextResponse.redirect(discordAuthUrl);
}
