import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow these paths without gate check
  const publicPaths = [
    '/gate', 
    '/api/', 
    '/_next/', 
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt',
    '/og-image.png',
    '/apple-touch-icon.png',
    '/google'
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
