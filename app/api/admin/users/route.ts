import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getPool } from '@/lib/db';

// GET: Get all users
export async function GET(request: Request) {
  try {
    const pool = await getPool();
    const [users] = await pool.query(
      'SELECT id, email, name, role, status, created_at, updated_at FROM users'
    );
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, status = 'active' } = body;

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'mentor', 'student'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, mentor, or student' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, role, status]
    );
    
    // Get the inserted ID
    const insertId = (result as any)[0].insertId;

    // Get the created user for response
    const [newUsers] = await pool.query(
      'SELECT id, email, name, role, status, created_at, updated_at FROM users WHERE id = ?',
      [insertId]
    );
    
    const newUser = (newUsers as any[])[0];

    return NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 