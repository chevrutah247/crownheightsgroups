import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Redirect non-www to www in production
  if (host === 'crownheightsgroups.com') {
    const url = request.nextUrl.clone();
    url.host = 'www.crownheightsgroups.com';
    return NextResponse.redirect(url, 308);
  }

  // Allow public paths without gate check
  const publicPaths = [
    '/gate',
    '/auth',
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt',
    '/og-image.png',
    '/apple-touch-icon.png',
    '/google',
    '/uploads/',
  ];

  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if user passed the gate
  const gatePassed = request.cookies.get('gate_passed')?.value;

  if (!gatePassed) {
    return NextResponse.redirect(new URL('/gate', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|google).*)'],
};
