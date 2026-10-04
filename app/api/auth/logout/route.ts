import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const res = NextResponse.json({ success: true });
  res.cookies.delete('sanghyun_session');
  return res;
}

export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const res = NextResponse.redirect(`${appUrl}/`);
  res.cookies.delete('sanghyun_session');
  return res;
}
