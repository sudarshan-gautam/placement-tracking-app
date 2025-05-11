import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_COOKIE_OPTIONS } from '@/lib/jwt-config';

// Helper function to open the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
}

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
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
        `SELECT id, name, email, role FROM users WHERE id = ?`,
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
      
      // Return the refreshed token and user data
      const response = NextResponse.json({
        user,
        token: newToken
      });
      
      // Update the token cookie
      response.cookies.set({
        name: 'authToken',
        value: newToken,
        httpOnly: JWT_COOKIE_OPTIONS.httpOnly,
        secure: JWT_COOKIE_OPTIONS.secure,
        sameSite: JWT_COOKIE_OPTIONS.sameSite,
        maxAge: JWT_COOKIE_OPTIONS.maxAge * 1000, // Convert seconds to milliseconds
        path: '/'
      });
      
      return response;
    } catch (tokenError) {
      console.error('Invalid or expired token:', tokenError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 