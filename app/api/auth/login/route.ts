import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db, { getDb, findUserByEmail, validateUser, getOne } from '@/lib/db';
import { cookies } from 'next/headers';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_COOKIE_OPTIONS } from '@/lib/jwt-config';

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

      // Get full user data including profile image
      const fullUserData = await getOne<{id: string, name: string, email: string, role: string, profileImage?: string}>(
        `SELECT u.id, u.name, u.email, u.role, p.profileImage 
         FROM users u 
         LEFT JOIN user_profiles p ON u.id = p.user_id 
         WHERE u.id = ?`,
        [user.id]
      );

      // Create a sanitized user object without the password
      const { password: _, ...userWithoutPassword } = user;
      
      // Merge profile data if available
      const userData = {
        ...userWithoutPassword,
        profileImage: fullUserData?.profileImage || null
      };
      
      console.log("Login successful, returning user with profile data");
      
      // Generate a JWT token using centralized JWT config
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      console.log("Generated JWT token for user");
      
      // Create a response with user data and token
      const response = NextResponse.json(
        { 
          user: userData,
          token: token
        }, 
        { status: 200 }
      );
      
      // Set a secure HTTP-only cookie with the essential user data for auth
      const cookieData = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileImage: userData.profileImage
      };
      
      // Set cookie with consistent settings from JWT config
      response.cookies.set({
        name: 'userData',
        value: JSON.stringify(cookieData),
        httpOnly: JWT_COOKIE_OPTIONS.httpOnly,
        secure: JWT_COOKIE_OPTIONS.secure,
        sameSite: JWT_COOKIE_OPTIONS.sameSite,
        maxAge: JWT_COOKIE_OPTIONS.maxAge * 1000, // Convert seconds to milliseconds
        path: '/'
      });
      
      // Also set the token in a cookie for easier auth across the app
      response.cookies.set({
        name: 'authToken',
        value: token,
        httpOnly: JWT_COOKIE_OPTIONS.httpOnly,
        secure: JWT_COOKIE_OPTIONS.secure,
        sameSite: JWT_COOKIE_OPTIONS.sameSite,
        maxAge: JWT_COOKIE_OPTIONS.maxAge * 1000, // Convert seconds to milliseconds
        path: '/'
      });
      
      return response;
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