import { NextResponse } from 'next/server';
import db, { getDb, findUserByEmail, validateUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    console.log("Login API called");
    const { email, password } = await request.json();
    console.log("Login attempt for email:", email);

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find and validate user
    try {
      const user = await validateUser(email, password);
      
      if (!user) {
        console.log("Invalid credentials for email:", email);
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log("User found:", { id: user.id, email: user.email, role: user.role });

      // Create a sanitized user object without the password
      const { password: _, ...userWithoutPassword } = user;
      console.log("Login successful, returning user:", userWithoutPassword);

      return NextResponse.json({ user: userWithoutPassword }, { status: 200 });
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 