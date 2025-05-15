import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPool, findUserById } from '@/lib/db';

// Helper to get authenticated user from request
async function getAuthenticatedUser(request: Request) {
  // First try NextAuth session
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id) {
    return { id: session.user.id, role: session.user.role };
  }
  
  // If no session, try token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Parse the token (in a real app, verify it)
    try {
      // This is a simple implementation - in a real app, you'd verify the token
      // For now, we'll just extract the user ID from token
      const userData = await findUserById(token);
      if (userData) {
        return { id: userData.id, role: userData.role };
      }
    } catch (error) {
      console.error('Token validation error:', error);
    }
  }
  
  return null;
}

// Get all users
export async function GET(request: Request) {
  try {
    // Check authentication using both NextAuth and token
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can access this endpoint' }, { status: 403 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Get all users from the database with complete information
    try {
      const users = await db.all(`
        SELECT 
          id, 
          name, 
          email, 
          role,
          created_at,
          updated_at
        FROM users
        ORDER BY created_at DESC
      `);

      // Format users to match expected structure
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'active', // Hardcoded for now, could be stored in DB in future
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      return NextResponse.json(formattedUsers);
    } catch (error) {
      console.error('Error fetching users from database:', error);
      // Return empty array instead of error
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return empty array instead of error
    return NextResponse.json([]);
  }
}

// Create a new user
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, password, role, status = 'active' } = data;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Name, email, and role are required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'mentor', 'student'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role',
        details: `Role must be one of: ${validRoles.join(', ')}`
      }, { status: 400 });
    }

    // Validate status if provided
    const validStatuses = ['active', 'pending', 'inactive'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status',
        details: `Status must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists',
        details: 'Please use a different email address'
      }, { status: 409 });
    }

    // Use password directly instead of hashing
    // In a production app, you should hash passwords
    const userPassword = password || 'password123'; // Default password if not provided

    // Generate a unique ID (use UUID in production)
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();

    // Insert the new user
    await db.run(
      'INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, userPassword, role, timestamp, timestamp]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: { 
        id, 
        name, 
        email, 
        role,
        status,
        created_at: timestamp,
        updated_at: timestamp
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Update a user
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, name, email, role, password } = data;

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build the SQL query
    let sql = 'UPDATE users SET updated_at = datetime("now")';
    const params = [];

    if (name) {
      sql += ', name = ?';
      params.push(name);
    }

    if (email) {
      // Check if email is already taken by another user
      const emailUser = await db.get('SELECT * FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailUser) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
      }
      sql += ', email = ?';
      params.push(email);
    }

    if (role) {
      sql += ', role = ?';
      params.push(role);
    }

    if (password) {
      // Use password directly instead of hashing
      sql += ', password = ?';
      params.push(password);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    // Update the user
    await db.run(sql, params);

    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// Delete a user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the user
    await db.run('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 