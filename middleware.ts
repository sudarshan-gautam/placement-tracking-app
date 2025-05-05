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

// Export a simplified version of roleMiddleware for API routes to use
export const roleMiddleware = async (request: Request, allowedRoles: string[]) => {
  // For this simplified version, we'll just parse the JWT from localStorage
  // that gets sent in the headers from the client side
  console.log('roleMiddleware called');
  
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      console.log('No token found in Authorization header');
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }
    
    // For now, just trust the token without verification
    // In a production app, you should verify the token
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    
    // Check if the user role is allowed
    if (!allowedRoles.includes(payload.role)) {
      console.log('User role not allowed:', payload.role);
      return NextResponse.json({ error: 'Forbidden - Role not allowed' }, { status: 403 });
    }
    
    return payload;
  } catch (error) {
    console.error('Error in roleMiddleware:', error);
    return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
  }
};

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