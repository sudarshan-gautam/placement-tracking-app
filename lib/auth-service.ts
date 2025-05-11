import { NextResponse } from 'next/server';

// Result type for authentication
interface AuthResult {
  success: boolean;
  error?: string;
  userId?: string;
  role?: string;
  status: number;
}

/**
 * Verifies authentication by checking the JWT token from the Authorization header
 * and authorizes the user based on their role
 */
export async function authenticateAndAuthorize(
  request: Request,
  allowedRoles?: string[]
): Promise<AuthResult> {
  try {
    // Check for token in Authorization header
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return {
        success: false,
        error: 'Unauthorized - Authentication token required',
        status: 401
      };
    }
    
    // Basic JWT validation (structure only)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return {
        success: false,
        error: 'Unauthorized - Invalid token format',
        status: 401
      };
    }
    
    // Parse the payload (without verification - in a production app, use a proper JWT library)
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Check if token payload has expected fields
      if (!payload.id || !payload.email || !payload.role) {
        return {
          success: false,
          error: 'Unauthorized - Invalid token payload',
          status: 401
        };
      }
      
      // Role-based authorization check if roles are specified
      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return {
          success: false,
          error: `Forbidden - Role '${payload.role}' not allowed`,
          status: 403
        };
      }
      
      // Authentication and authorization successful
      return {
        success: true,
        userId: payload.id,
        role: payload.role,
        status: 200
      };
      
    } catch (error) {
      console.error('Error parsing token payload:', error);
      return {
        success: false,
        error: 'Unauthorized - Invalid token payload',
        status: 401
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Internal server error during authentication',
      status: 500
    };
  }
} 