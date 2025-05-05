import { NextResponse } from 'next/server';
import { getDb, findUserByEmail, runQuery } from '@/lib/db';
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
    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Use password directly instead of hashing
    const plainPassword = password;

    // Insert new user
    const userId = uuidv4();
    
    await runQuery(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, plainPassword, name, role]
    );

    // Get the created user for response
    const db = getDb();
    const newUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, name, role FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

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