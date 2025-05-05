import jwt from 'jsonwebtoken';
import { getPool } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export async function verifyAuth(token: string) {
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get user from database to ensure they still exist and have same role
    const pool = await getPool();
    const [users] = await pool.query(
      'SELECT id, email, role, name FROM users WHERE id = ? AND role = ?',
      [decoded.id, decoded.role]
    );

    if (!users || (users as any[]).length === 0) {
      return null;
    }

    const user = (users as any[])[0];
    return user;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
} 