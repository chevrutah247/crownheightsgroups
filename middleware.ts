import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Redirect non-www to www in production
  if (host === 'crownheightsgroups.com') {
    const url = request.nextUrl.clone();
    url.host = 'www.crownheightsgroups.com';
    return NextResponse.redirect(url, 308);
  }

  // Add noindex for private pages (instead of robots.txt Disallow)
  const path = request.nextUrl.pathname;
  if (path.startsWith('/auth/') || path.startsWith('/profile') || path.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|google).*)'],
};
