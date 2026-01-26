import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow these paths without gate check
  const publicPaths = ['/gate', '/api/', '/_next/', '/favicon.ico'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if user passed the gate
  const gatePassed = request.cookies.get('gate_passed')?.value;
  
  if (!gatePassed && pathname !== '/gate') {
    return NextResponse.redirect(new URL('/gate', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
