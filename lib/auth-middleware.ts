import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { JWT_SECRET } from './jwt-config';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
}

// Helper function to open the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
}

// Authentication middleware
export async function roleMiddleware(request: NextRequest): Promise<User | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid authorization header found');
      return null;
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.error('No token found in authorization header');
      return null;
    }
    
    // Use the centralized JWT_SECRET from jwt-config.ts
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
    
    if (!decoded.id) {
      console.error('Invalid token payload - no user ID');
      return null;
    }
    
    // Open database connection
    const db = await openDb();
    
    // Fetch user from database
    const user = await db.get<User>(
      `SELECT id, name, email, role FROM users WHERE id = ?`,
      decoded.id
    );
    
    // Close database connection
    await db.close();
    
    if (!user) {
      console.error('User not found in database');
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return null;
  }
} 