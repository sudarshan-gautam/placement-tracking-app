import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
// Remove the import that indirectly uses SQLite
// import { verifyAuth } from '@/lib/auth-utils';

// List of paths that don't require authentication
const publicPaths = [
  '/',
  '/register',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth',
  '/api/auth/login',
  '/api/auth/register',
  '/favicon.ico',
  '/_next',
];

// Routes with specific role requirements
const adminRoutes = ['/admin'];
const mentorRoutes = ['/mentor'];
const studentRoutes = ['/dashboard', '/student'];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Handle redirects for the legacy /activities and /sessions pages
  const { pathname } = request.nextUrl;
  if (pathname === '/activities' || pathname === '/sessions' || 
      pathname.startsWith('/activities/') || pathname.startsWith('/sessions/')) {
    // If user is authenticated, redirect to role-specific page
    if (token && token.role) {
      let redirectPath;
      
      // Determine the base redirect path
      if (pathname === '/activities' || pathname.startsWith('/activities/')) {
        // For activities pages
        const suffix = pathname.replace('/activities', '');
        redirectPath = `/${token.role}/activities${suffix}`;
      } else {
        // For sessions pages
        const suffix = pathname.replace('/sessions', '');
        redirectPath = `/${token.role}/sessions${suffix}`;
      }
      
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    // If not authenticated, redirect to login page
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  const userDataCookie = request.cookies.get('userData');
  
  // Skip middleware for static assets and API routes to prevent issues
  if (
    pathname.includes('/_next/') || 
    pathname.includes('.') || 
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }
  
  // Allow access to public paths (including all auth paths)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated
  if (!userDataCookie) {
    // Redirect to landing page for all protected paths
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  try {
    // Parse the user data
    const userData = JSON.parse(userDataCookie.value);
    const userRole = userData.role;
    
    // Check role-based access
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      // Unauthorized access to admin routes - redirect to landing page
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (pathname.startsWith('/mentor') && userRole !== 'mentor' && userRole !== 'admin') {
      // Unauthorized access to mentor routes - redirect to landing page
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Allow access for authenticated users with appropriate role
    return NextResponse.next();
    
  } catch (error) {
    console.error('Error parsing user data:', error);
    // If there's an error parsing the user data, redirect to landing page
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Helper function to check if the path is public
function isPublicPath(path: string): boolean {
  // Check exact matches first
  if (publicPaths.includes(path)) {
    return true;
  }
  
  // Special handling for auth directory - all auth paths are public
  if (path.startsWith('/auth/')) {
    return true;
  }
  
  // Check path prefixes for other public paths
  return publicPaths.some(publicPath => {
    if (publicPath.endsWith('/')) {
      return path === publicPath.slice(0, -1) || path.startsWith(publicPath);
    }
    return path.startsWith(`${publicPath}/`);
  });
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

// Configure the paths that should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/activities',
    '/sessions',
    '/activities/:path*',
    '/sessions/:path*'
  ],
}; 