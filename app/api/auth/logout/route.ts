import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBaseUrl, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const appUrl = getBaseUrl(req);
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete('sanghyun_user_hint');

  const res = NextResponse.redirect(`${appUrl}/`);
  res.cookies.delete(COOKIE_NAME);
  res.cookies.delete('sanghyun_user_hint');
  return res;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete('sanghyun_user_hint');

  const res = NextResponse.json({ success: true });
  res.cookies.delete(COOKIE_NAME);
  res.cookies.delete('sanghyun_user_hint');
  return res;
}
