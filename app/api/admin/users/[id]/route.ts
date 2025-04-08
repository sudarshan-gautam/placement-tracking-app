import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getPool } from '@/lib/db';

// GET: Get a specific user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const pool = await getPool();
    const [users] = await pool.query(
      'SELECT id, email, name, role, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    const user = (users as any[])[0];
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH: Update a user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, email, password, role, status } = body;

    // Validate the required fields
    if (!name && !email && !role && !status && !password) {
      return NextResponse.json(
        { error: 'At least one field to update is required' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    
    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if ((existingUsers as any[]).length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build update query
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    const updateFields = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (email) {
      // Check if email is already taken by another user
      const [emailUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      
      if ((emailUsers as any[]).length > 0) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
      
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (role) {
      if (!['admin', 'mentor', 'student'].includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be admin, mentor, or student' },
          { status: 400 }
        );
      }
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (status) {
      if (!['active', 'inactive', 'pending'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be active, inactive, or pending' },
          { status: 400 }
        );
      }
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    updateQuery += updateFields.join(', ');
    updateQuery += ' WHERE id = ?';
    updateValues.push(id);

    // Execute update
    await pool.query(updateQuery, updateValues);

    // Get updated user
    const [updatedUsers] = await pool.query(
      'SELECT id, email, name, role, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    const updatedUser = (updatedUsers as any[])[0];

    return NextResponse.json(
      { message: 'User updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const pool = await getPool();
    
    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if ((existingUsers as any[]).length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete user
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 