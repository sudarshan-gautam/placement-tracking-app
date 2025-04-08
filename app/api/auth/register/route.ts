import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getPool } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'student' } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const pool = await getPool();
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user with default active status for self-registration
    const status = 'active';
    await pool.query(
      'INSERT INTO users (id, email, password, name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), email, hashedPassword, name, role, status]
    );

    // Get the created user for response
    const [newUsers] = await pool.query(
      'SELECT id, email, name, role, status FROM users WHERE email = ?',
      [email]
    );
    
    const newUser = (newUsers as any[])[0];

    return NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 