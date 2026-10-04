import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, checkUserPermissions, UserSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${appUrl}/api/auth/callback`;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?error=missing_code`);
  }

  const clientId = process.env.DISCORD_CLIENT_ID || '1555170310498549840';
  const clientSecret = process.env.DISCORD_CLIENT_SECRET || '3hQDsYiejIdwLaZKfuEMt9HZ9hGuTZUv';

  try {
    const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Discord OAuth token error:', err);
      return NextResponse.redirect(`${appUrl}/?error=token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${appUrl}/?error=user_fetch_failed`);
    }

    const userData = await userRes.json();
    const permissions = await checkUserPermissions(accessToken, userData.id);

    const sessionPayload: UserSession = {
      userId: userData.id,
      username: userData.global_name || userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        : null,
      isAdmin: permissions.isAdmin,
      isStudent: permissions.isStudent,
      studentId: permissions.studentId,
    };

    const sessionToken = await createSessionToken(sessionPayload);

    const targetRedirect = permissions.isAdmin ? `${appUrl}/admin` : `${appUrl}/dashboard`;
    const response = NextResponse.redirect(targetRedirect);

    response.cookies.set('sanghyun_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.redirect(`${appUrl}/?error=server_error`);
  }
}
