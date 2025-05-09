import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Constants
const MAIN_ADMIN_EMAIL = 'admin@example.com';

// Get a specific user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Get the user
    const user = await db.get(`
      SELECT 
        id, 
        name, 
        email, 
        role,
        created_at,
        updated_at
      FROM users 
      WHERE id = ?
    `, [id]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: 'active', // Hardcoded for now
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// Update a user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    const { name, email, role, password, status } = data;

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

    // Check if the user to be updated is the main admin
    // Only allow changing name and password for main admin, not email or role
    if (existingUser.email === MAIN_ADMIN_EMAIL) {
      if (email && email !== MAIN_ADMIN_EMAIL) {
        return NextResponse.json({ 
          error: 'Cannot change main admin email',
          details: 'The main administrator email cannot be changed' 
        }, { status: 403 });
      }
      
      if (role && role !== 'admin') {
        return NextResponse.json({ 
          error: 'Cannot change main admin role',
          details: 'The main administrator role cannot be changed' 
        }, { status: 403 });
      }
    }

    // Build the SQL query
    let sql = 'UPDATE users SET updated_at = datetime("now")';
    const queryParams: any[] = [];

    if (name) {
      sql += ', name = ?';
      queryParams.push(name);
    }

    if (email) {
      // Check if email is already taken by another user
      const emailUser = await db.get('SELECT * FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailUser) {
        return NextResponse.json({ 
          error: 'Email is already in use',
          details: 'Please use a different email address'
        }, { status: 409 });
      }
      sql += ', email = ?';
      queryParams.push(email);
    }

    if (role) {
      sql += ', role = ?';
      queryParams.push(role);
    }

    if (password) {
      sql += ', password = ?';
      queryParams.push(password);
    }

    sql += ' WHERE id = ?';
    queryParams.push(id);

    // Update the user
    await db.run(sql, queryParams);

    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Get the current user's session
    const session = await getServerSession(authOptions);
    const currentUser = session?.user as { id?: string; email?: string; role?: string } | undefined;

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Check if user exists
    const userToDelete = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of the main admin account
    if (userToDelete.email === MAIN_ADMIN_EMAIL) {
      return NextResponse.json({ 
        error: 'Cannot delete main admin account',
        details: 'The main administrator account cannot be deleted'
      }, { status: 403 });
    }

    // Prevent users from deleting themselves
    if (currentUser && (currentUser.id === id || currentUser.email === userToDelete.email)) {
      return NextResponse.json({ 
        error: 'Cannot delete yourself',
        details: 'You cannot delete your own account. Please ask another admin to do this.'
      }, { status: 403 });
    }

    // Start a transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Remove any mentor-student assignments for this user
      if (userToDelete.role === 'mentor') {
        await db.run('DELETE FROM mentor_student_assignments WHERE mentor_id = ?', [id]);
      } else if (userToDelete.role === 'student') {
        await db.run('DELETE FROM mentor_student_assignments WHERE student_id = ?', [id]);
      }

      // Delete the user
      await db.run('DELETE FROM users WHERE id = ?', [id]);

      // Commit the transaction
      await db.run('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: 'User deleted successfully' 
      }, { status: 200 });
    } catch (error) {
      // Rollback on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 