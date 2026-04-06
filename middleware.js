import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // Redirect non-www to www
  if (host === 'crownheightsgroups.com') {
    const url = request.nextUrl.clone();
    url.host = 'www.crownheightsgroups.com';
    return NextResponse.redirect(url, 308); // 308 preserves POST method
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};