import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // For a real application, you would verify a JWT token here
  // For this demo, we'll check localStorage in the client-side auth context
  
  // Allow all requests to proceed for now
  // Role-based protection will be handled client-side
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Protect dashboard routes
    '/dashboard/:path*',
    '/overview/:path*',
    '/competencies/:path*',
    '/qualifications/:path*',
    '/action-plan/:path*',
    '/sessions/:path*',
    '/documents/:path*',
    '/quick-actions/:path*',
    
    // Exclude API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 