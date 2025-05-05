import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get all users
export async function GET() {
  try {
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Get all users
    const users = await db.all(`
      SELECT 
        id,
        email,
        name,
        role,
        created_at,
        updated_at,
        profileImage
      FROM users
      ORDER BY created_at DESC
    `);

    // Don't return sensitive information like passwords
    const sanitizedUsers = users.map(user => ({
      ...user,
      password: undefined,
      status: 'active', // Hardcoded for now, could add status column to users table
    }));

    return NextResponse.json(sanitizedUsers, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Create a new user
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, password, role } = data;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Use password directly instead of hashing
    const plainPassword = password;

    // Generate a random ID
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Insert the new user
    await db.run(
      'INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
      [id, name, email, plainPassword, role]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: { id, name, email, role }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
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