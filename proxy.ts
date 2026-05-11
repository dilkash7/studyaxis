import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect Student Dashboard & Applications
  if (pathname.startsWith('/student/dashboard') || pathname.startsWith('/student/applications')) {
    const studentToken = request.cookies.get('studentToken')?.value;
    if (!studentToken) {
      return NextResponse.redirect(new URL('/student/login', request.url));
    }
  }

  return NextResponse.next();
}

// Optimize proxy execution to only run on protected route groups
export const config = {
  matcher: [
    '/admin/:path*',
    '/student/dashboard/:path*',
    '/student/applications/:path*'
  ],
};
