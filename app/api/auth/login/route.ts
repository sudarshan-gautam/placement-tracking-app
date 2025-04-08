import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import db, { getPool } from '@/lib/db';

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

    // Find user by email
    const pool = await getPool();
    console.log("DB pool obtained");
    
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      console.log("Query executed, results:", rows);
      
      const users = rows as any[];
      const user = users[0];

      if (!user) {
        console.log("No user found with email:", email);
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log("User found:", { id: user.id, email: user.email, role: user.role });

      // Compare passwords
      console.log("Stored password hash:", user.password);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("Password valid:", isPasswordValid);
      
      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

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