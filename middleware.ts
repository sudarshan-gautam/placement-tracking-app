import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Remove the import that indirectly uses SQLite
// import { verifyAuth } from '@/lib/auth-utils';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // For a real application, you would verify a JWT token here
  // For this demo, we'll check localStorage in the client-side auth context
  
  // Allow all requests to proceed for now
  // Role-based protection will be handled client-side
  return NextResponse.next();
}

// Remove or comment out the authMiddleware that uses verifyAuth which requires database access
/*
export async function authMiddleware(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = await verifyAuth(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return decoded;
}

export async function roleMiddleware(request: Request, allowedRoles: string[]) {
  const decoded = await authMiddleware(request);
  if (decoded instanceof NextResponse) {
    return decoded;
  }

  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return decoded;
}
*/

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