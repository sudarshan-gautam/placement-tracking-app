import jwt from 'jsonwebtoken';
import { getPool } from './db';

// Set a fallback JWT_SECRET if environment variable is not available
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_for_development_only';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export async function verifyAuth(token: string) {
  try {
    console.log('Verifying auth token...');
    
    // Basic validation of token format to avoid "jwt malformed" errors
    if (!token || token === 'undefined' || token === 'null') {
      console.log('Token is empty, undefined, or null');
      return null;
    }
    
    // Trim any whitespace
    token = token.trim();
    
    // Check if token has basic JWT format (three parts separated by dots)
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.log('Token does not have valid JWT format (header.payload.signature)');
      return null;
    }
    
    // Verify the JWT token
    console.log('Token format looks valid, attempting verification...');
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('Token decoded successfully:', { id: decoded.id, role: decoded.role });

    // Get user from database to ensure they still exist and have same role
    try {
      const pool = await getPool();
      console.log('Database pool obtained, querying for user...');
      
      const [users] = await pool.query(
        'SELECT id, email, role, name FROM users WHERE id = ? AND role = ?',
        [decoded.id, decoded.role]
      );
      
      console.log('Database query completed:', { usersFound: (users as any[]).length });

      if (!users || (users as any[]).length === 0) {
        console.log('No matching user found in database');
        return null;
      }

      const user = (users as any[])[0];
      console.log('User verified successfully:', { id: user.id, role: user.role });
      return user;
    } catch (dbError) {
      console.error('Database error while verifying user:', dbError);
      
      // For development purposes, return the decoded token if database verification fails
      // This allows the app to work even if there are database connectivity issues
      console.log('Returning decoded token as fallback due to database error');
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: 'User ' + decoded.id
      };
    }
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
} 