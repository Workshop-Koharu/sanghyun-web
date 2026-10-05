import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'sanghyun-high-school-secret-key-32-chars-minimum-key';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = 'sanghyun_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. CSRF Origin Protection for State-Changing API Requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) && pathname.startsWith('/api/')) {
    // Allow Discord OAuth callback if any
    if (!pathname.startsWith('/api/auth/')) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      if (origin && host) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return new NextResponse(
              JSON.stringify({ error: 'CSRF verification failed: Origin mismatch' }),
              { status: 403, headers: { 'content-type': 'application/json' } }
            );
          }
        } catch {
          return new NextResponse(
            JSON.stringify({ error: 'CSRF verification failed: Invalid origin' }),
            { status: 403, headers: { 'content-type': 'application/json' } }
          );
        }
      }
    }
  }

  // 2. Session verification helper
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let sessionPayload: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY, { clockTolerance: 60 });
      sessionPayload = payload;
    } catch {
      sessionPayload = null;
    }
  }

  // 3. Admin API Route Protection (/api/admin/*)
  if (pathname.startsWith('/api/admin/')) {
    if (!sessionPayload) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    if (!sessionPayload.isAdmin) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Administrator privileges required' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // 4. Student API Route Protection (/api/student/*)
  if (pathname.startsWith('/api/student/')) {
    if (!sessionPayload) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // 5. Admin Page Route Protection (/admin)
  if (pathname.startsWith('/admin')) {
    if (!sessionPayload) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!sessionPayload.isAdmin) {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // 6. Dashboard Page Route Protection (/dashboard)
  if (pathname.startsWith('/dashboard')) {
    if (!sessionPayload) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/student/:path*',
  ],
};
