import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { JWT_SECRET, JWT_EXPIRES_IN } from '@/lib/jwt-config';

// Helper function to open the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
}

export async function GET(request: NextRequest) {
  try {
    // Check for token in cookies first
    const authToken = request.cookies.get('authToken')?.value;
    
    // If no cookie token, check authorization header
    const authHeader = !authToken ? request.headers.get('authorization') : null;
    let token = authToken;
    
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // If no token found, user is not authenticated
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };
      
      // Get fresh user data from database
      const db = await openDb();
      const user = await db.get(
        `SELECT u.id, u.name, u.email, u.role, p.profileImage 
         FROM users u 
         LEFT JOIN user_profiles p ON u.id = p.user_id 
         WHERE u.id = ?`,
        decoded.id
      );
      await db.close();
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }
      
      // Generate a fresh token
      const newToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return user data and fresh token
      return NextResponse.json({
        authenticated: true,
        user,
        token: newToken
      });
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 